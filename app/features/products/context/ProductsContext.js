import { createContext, useState, useMemo } from 'react'

import { useAuthUser } from 'next-firebase-auth'

import { query, collection, where, getDocs, orderBy } from '@firebase/firestore'
import { db } from '@/utils/firebase'

export const ProductsContext = createContext()
export const ProductsProvider = ({ children }) => {
  const AuthUser = useAuthUser()

  const [ previouslyBought, setPreviouslyBought ] = useState([])
  const [ currentItem, setCurrentItem ] = useState(null)

  const checkItem = useMemo(() => {
    return () => {
      checkIfPreviouslyBought()
    }
  }, [AuthUser.id])

  const checkIfPreviouslyBought = async () => {
    const ordersRef = query(collection(db, "orders"), where("id", "==", AuthUser.id), orderBy('time', "desc"))
    const ordersSnapshot = await getDocs(ordersRef)
    const itemIDsAndTimeOrderPlaced = ordersSnapshot?.docs?.map(doc => ({
      time: doc.data().time,
      items: doc.data().items.map(item => item.id),
      orderID: doc.data().orderID
    }))

    setPreviouslyBought(itemIDsAndTimeOrderPlaced)
  }

  //set current item, get data from db, set data to state, add dislike/like, add reviews

  return (
    <ProductsContext.Provider value={{
      previouslyBought,

      currentItem,
      checkItem
    }}>
      {children}
    </ProductsContext.Provider>
  )
}