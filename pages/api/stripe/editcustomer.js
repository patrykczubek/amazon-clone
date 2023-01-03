const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

import { getUserFromCookies } from 'next-firebase-auth'

import { db } from '@/utils/firebase'
import { collection, getDoc, doc, addDoc, Timestamp, setDoc } from '@firebase/firestore'

export default async function handler(req,res) {
  let user
  try {
    user = await getUserFromCookies({ req })
  } catch (e) {
    console.error(e)
    return res.status(403).json({ error: 'Not authorized' })
  }

  let { data, id } = JSON.parse(req.body) || {}

  let userData, stripeCustomerID

  const userInfoRef = doc(db, "users", user.id)
  const userInfoSnapshot = await getDoc(userInfoRef)
  userData = userInfoSnapshot.data()

  if(userData?.stripeCustomerID){
    stripeCustomerID = userData?.stripeCustomerID
  }else{
    const customer = await stripe.customers.create({
      email: user.email,
      name: data.name,
    })

    stripeCustomerID = customer.id
  }

  const stripeUpdate = async (data, customerID, billingSameAsShipping, billingAddress) => {
    await stripe.customers.update(customerID, {
      name: data.name,
      phone: data.phoneNumber,
      address: {
        line1: data.line1,
        line2: data.line2,
        city: data.city,
        state: data.state,
        postal_code: data.zip,
        country: 'US'
      },
      shipping: {
        name: data.name,
        address: {
          line1: billingSameAsShipping ? data.line1 : billingAddress?.line1,
          line2: billingSameAsShipping ? data.line2 : billingAddress?.line2,
          city: billingSameAsShipping ? data.city : billingAddress?.city,
          state: billingSameAsShipping ? data.state : billingAddress?.state,
          postal_code: billingSameAsShipping ? data.zip : billingAddress?.zip,
          country: 'US'
        }
      }
    })
  }

  if(id){
    const addressInfoRef = doc(db, "userShipmentAddresses", id)
    const addressInfoSnap = await getDoc(addressInfoRef)

    if(!addressInfoSnap.exists()){
      return res.status(403).json({ success: false })
    }else{
      const billingSameAsShipping = data.billingSameAsShipping
      const { billingAddress } = data || {}

      setDoc(addressInfoRef, {
        name: data.name,
        phoneNumber: data.phoneNumber,

        shippingAddress: {
          line1: data.line1,
          line2: data.line2,
          city: data.city,
          state: data.state,
          zip: data.zip,
          country: 'US'
        },
        billingSameAsShipping: billingSameAsShipping,
        billingAddress: {
          line1: billingSameAsShipping ? data.line1 : billingAddress?.line1,
          line2: billingSameAsShipping ? data.line2 : billingAddress?.line2,
          city: billingSameAsShipping ? data.city : billingAddress?.city,
          state: billingSameAsShipping ? data.state : billingAddress?.state,
          zip: billingSameAsShipping ? data.zip : billingAddress?.zip,
          country: 'US'
        }
      }, { merge: true })

      if(data?.defaultAddress || !userData?.defaultAddress){
        stripeUpdate(data, stripeCustomerID, billingSameAsShipping, billingAddress)
        setDoc(doc(db, "users", user.id), { defaultAddress: id }, { merge: true })
      }
      return res.status(200).json({ success: true })
    }
  }else{
    const billingSameAsShipping = data.billingSameAsShipping
    const { billingAddress } = data || {}

    const q = collection(db, "userShipmentAddresses")

    const addRec = await addDoc(q, {
      id: user.id,
      name: data.name,
      email: user.email,
      phoneNumber: data.phoneNumber,

      shippingAddress: {
        line1: data.line1,
        line2: data.line2,
        city: data.city,
        state: data.state,
        zip: data.zip,
        country: 'US'
      },
      billingSameAsShipping: billingSameAsShipping,
      billingAddress: {
        line1: billingSameAsShipping ? data.line1 : billingAddress?.line1,
        line2: billingSameAsShipping ? data.line2 : billingAddress?.line2,
        city: billingSameAsShipping ? data.city : billingAddress?.city,
        state: billingSameAsShipping ? data.state : billingAddress?.state,
        zip: billingSameAsShipping ? data.zip : billingAddress?.zip,
        country: 'US'
      }
    })

    if(data?.defaultAddress || !userData?.defaultAddress){
      stripeUpdate(data, stripeCustomerID, billingSameAsShipping, billingAddress)
      setDoc(doc(db, "users", user.id), { defaultAddress: addRec.id }, { merge: true })
    }

    res.status(200).json({ success: true })
  }
}