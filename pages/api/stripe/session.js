const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

import { getUserFromCookies } from 'next-firebase-auth'

import { db } from '@/utils/firebase'
import { collection, getDocs, query, where, documentId, doc, getDoc } from '@firebase/firestore'

export default async function handler(req,res) {
  const { cart } = JSON.parse(req.body)

  let user
  try {
    user = await getUserFromCookies({ req })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
    return res.status(403).json({ error: 'Not authorized' })
  }


  const IDsFromCart = cart.map(v => v.id)

  const itemsWithVerifiedPrices = []

  const q = query(collection(db, "products"), where(documentId(), "in", IDsFromCart))
  const docs = await getDocs(q)

  docs.forEach((item) => {
    itemsWithVerifiedPrices.push({id: item.id, ...item.data()})
  })

  const lineItems = []

  for (const key in cart) {
    const itemDataFromFirebase = itemsWithVerifiedPrices.find(v => v.id === cart[key].id)

    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: itemDataFromFirebase.name,
          images: [itemDataFromFirebase.thumbnail]
        },
        unit_amount: Math.round((itemDataFromFirebase.discount ? (itemDataFromFirebase.price-(itemDataFromFirebase.price*(itemDataFromFirebase.discountPercentage/100))) : itemDataFromFirebase.price) * 100)
      },
      quantity: cart[key].quantity,
      id: cart[key].id
    })
  }

  const lineItemsWithoutIDS = lineItems.map(({id, ...rest}) => {
    return rest
  })

  const metadataItems = lineItems.map(d => {
    return {
      id: d.id,
      quantity: d.quantity,
      price: d.price_data.unit_amount
    }
  })

  let userData, stripeCustomerID

  const qq = doc(db, "users", user.id)
  const d = await getDoc(qq)
  userData = d.data()

  if(userData?.stripeCustomerID){
    stripeCustomerID = userData?.stripeCustomerID
  }

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerID,
    line_items: [...lineItemsWithoutIDS],
    shipping_address_collection: {
      allowed_countries: ['US']
    },
    mode: 'payment',
    success_url: 'http://localhost:3000/dashboard/orders/{CHECKOUT_SESSION_ID}',
    cancel_url: 'http://localhost:3000/cart',
    metadata: {
      items: JSON.stringify(metadataItems)
    }
  })

  res.status(200).json({ session })
}