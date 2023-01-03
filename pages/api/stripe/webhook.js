import initStripe from 'stripe'
import { buffer } from 'micro'

export const config = { api: { bodyParser: false } }

import { db } from '@/utils/firebase'
import { doc, Timestamp, setDoc, addDoc, collection, query, where, getDocs } from '@firebase/firestore'

const handler = async (req, res) => {
  const stripe = initStripe(process.env.STRIPE_SECRET_KEY)
  const signature = req.headers["stripe-signature"]
  const signingSecret = process.env.STRIPE_SIGNING_KEY
  const reqBuffer = await buffer(req)

  let event

  try {
    event = stripe.webhooks.constructEvent(reqBuffer, signature, signingSecret)
  } catch (error) {
    console.log(error)
    return res.status(400).send(`Webhook error: ${error.message}`)
  }

  const { data } = event

  switch(event.type){
    case 'checkout.session.completed':
      if(data.object.mode === "subscription"){
        const subscription = await stripe.subscriptions.retrieve(data.object.subscription, {
          expand: ['default_payment_method']
        })

        addDoc(collection(db, "subscriptions"), {
          id: data.object.id,
          email: data.object.metadata.user_email,
          price_id: subscription.items.data[0].price.id,
          status: subscription.status,
          quantity: subscription.quantity,
          subscription: data.object.subscription,
          cancel_at_period_end: subscription.cancel_at_period_end,
          cancel_at: subscription.cancel_at ? Timestamp.fromMillis(subscription.cancel_at*1000) : null,
          current_period_start: subscription.current_period_start ? Timestamp.fromMillis(subscription.current_period_start*1000) : null,
          current_period_end: subscription.current_period_end ? Timestamp.fromMillis(subscription.current_period_end*1000) : null,
          created: subscription.created ? Timestamp.fromMillis(subscription.created*1000) : null,
          trial_start: subscription.trial_start ? Timestamp.fromMillis(subscription.trial_start*1000) : null,
          trial_end: subscription.trial_end ? Timestamp.fromMillis(subscription.trial_end*1000) : null
        })
      }else{
        const q = query(collection(db, "users"), where("stripeCustomerID", "==", data.object.customer))
        const docs = await getDocs(q)
        const docInfo = docs.docs[0].data()

        const docRef = doc(db, "orders", data.object.id)

        setDoc(docRef, {
          id: docInfo.uid,
          time: Timestamp.now(),
          orderID: data.object.id,
          items: JSON.parse(data.object.metadata.items),
          total: data.object.amount_total/100
        })

        setDoc(doc(db, "carts", docInfo.uid), { cart: [], removeLocalCart: true})
      }

      break
    case 'customer.subscription.deleted':
      const q = query(collection(db, "subscriptions"), where("subscription", "==", data.object.id))
      const docs = await getDocs(q)

      docs.forEach((doc) => {
        setDoc(doc.ref, {
          status: 'canceled'
        }, { merge: true })
      })

      break
    default:
      console.log('other', event)
      break
  }

  res.send({ received: true })
}

export default handler