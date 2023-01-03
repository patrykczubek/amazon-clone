import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import { db } from '@/utils/firebase'
import { collection, deleteDoc, doc, getDoc, onSnapshot, query, setDoc, where } from '@firebase/firestore'

import { isMounted } from '@/hooks/isMounted'

import { useDeliveryInstructionsModal } from './InstructionsModal'
import { useAuthUser } from 'next-firebase-auth'

export const Address = () => {
  const user = useAuthUser()
  const router = useRouter()

  const { mounted } = isMounted()
  const { toggleDeliveryInstructionsModal, DeliveryInstructionsModal } = useDeliveryInstructionsModal()

  const [ userAddresses, setUserAddresses ] = useState([])
  const [ defaultAddress, setDefaultAddress ] = useState(null)
  const [ redirectBack, setRedirectBack ] = useState(false)

  useEffect(() => {
    if(!mounted) return

    const q = query(collection(db, "userShipmentAddresses"), where('id', "==", user.id))
    const unsub = onSnapshot(q, async (snapshot) => {
      setUserAddresses(
        snapshot.docs.map(doc => {
          return { docID: doc.id, ...doc.data() }
        }
      ))

      const userInfoRef = doc(db, "users", user.id)
      const userInfoSnapshot = await getDoc(userInfoRef)
      const userData = userInfoSnapshot.data()

      setDefaultAddress(userData?.defaultAddress)
    })

    return () => {
      unsub()
    }
  }, [mounted])

  useEffect(() => {
    const { query } = router
    if(query.length === 0 && redirectBack) return

    if(query.return){
      setRedirectBack(true)
    }
  }, [router.query])

  const removeAddress = async (docID) => {
    deleteDoc(doc(db, "userShipmentAddresses", docID))
  }

  const setAsDefault = async (docID) => {
    // update in stripe
    setDoc(doc(db, "users", user.id), { defaultAddress: docID }, { merge: true })
    setDefaultAddress(docID)
  }

  return (
    <div>
      <h1>Current Saved Addresses</h1>

      <DeliveryInstructionsModal/>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-5">
        {userAddresses.map((item, i) => (
          <div key={i} className="p-6 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
            {item?.docID === defaultAddress && <h5 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Default</h5>}
            <p className="font-semibold text-gray-500 dark:text-gray-400">{item.name}</p>
            <p className="font-normal text-gray-500 dark:text-gray-400">{item.shippingAddress.line1}</p>
            <p className="font-normal text-gray-500 dark:text-gray-400">{item.shippingAddress.city}, {item.shippingAddress.state} {item.shippingAddress.zip} {item.shippingAddress.country}</p>
            <p className="font-normal text-gray-500 dark:text-gray-400">Phone number: {item?.phoneNumber}</p>
            <button onClick={() => toggleDeliveryInstructionsModal(item)} className="mt-4 px-4 py-2 font-semibold text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">Add delivery instructions</button>
            <div className='flex space-x-2'>
              <button onClick={() => router.push(`account/manageaddress/${item.docID}`)} className="mt-4 px-4 py-2 font-semibold text-white bg-purple-500 rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">Edit</button>
              <div className='border-r-2 border-gray-300 h-6 my-auto'></div>
              {item?.docID !== defaultAddress && <button onClick={() => removeAddress(item.docID)} className="mt-4 px-4 py-2 font-semibold text-white bg-red-500 rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">Remove</button>}
              <div className='border-r-2 border-gray-300 h-6 my-auto'></div>
              {item?.docID !== defaultAddress && <button onClick={() => setAsDefault(item.docID)} className="mt-4 px-4 py-2 font-semibold text-white bg-yellow-500 rounded-lg shadow-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">Set as default</button>}
            </div>
          </div>
        ))}
      </div>

      <Link href="/dashboard/account/manageaddress">
        <a href="/dashboard/account/manageaddress" className="px-4 py-2 font-semibold text-white bg-teal-600 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">
          Add New Address
        </a>
      </Link>
    </div>
  )
}