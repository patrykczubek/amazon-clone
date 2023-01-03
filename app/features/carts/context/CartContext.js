import { createContext, useState, useEffect } from 'react'

import { useAuthUser } from 'next-firebase-auth'
import { isUserLoading } from '../../auth/hooks/isUserLoading'

import { setDoc, doc, getDoc, query, collection, where, limit, getDocs } from '@firebase/firestore'
import { db } from '@/utils/firebase'

import { getStorage, setStorage } from '@/utils/localStorage'

export const CartContext = createContext()
export const CartPrivder = ({ children }) => {
  const AuthUser = useAuthUser()

  const { loading, hasUser } = isUserLoading(AuthUser)
  const [ cart, setCart ] = useState([])
  const [ quantity, setQuantity ] = useState(0)
  const [ sync, setSync ] = useState(false)

  useEffect(() => {
    if(loading) return

    if(hasUser){
      const func = async () => {
        const cartData = getStorage("cart", true) || []

        const docRef = doc(db, "carts", AuthUser.id)
        const docSnap = await getDoc(docRef)
        let docData = docSnap.data()

        if(!docSnap.exists()){
          setDoc(doc(db, "carts", AuthUser.id), { cart: [] })
          docData = { cart: [] }
        }

        if(docData?.removeLocalCart){
          setCart([])
          setStorage("cart", [], true)
          setDoc(doc(db, "carts", AuthUser.id), { cart: [] })
        }

        if(!getStorage("merged", false)){
          const mergedArray = docData.cart.concat(cartData)
          const uniqueArray = mergedArray.reduce((acc, item) => {
            if (!acc.find(i => i.id === item.id)) acc.push(item)
            return acc
          }, [])

          setDoc(doc(db, "carts", AuthUser.id), { cart: uniqueArray })

          setCart(uniqueArray)
          setSync(true)

          setStorage("merged", true, false)
        }
      }
      func()
    }
  }, [hasUser, loading])

  useEffect(() => {
    if(loading) return

    window.addEventListener('storage', (e) => {
      if(e.key !== "cart") return

      const cartData = JSON.parse(e.newValue) || []
      setCart(cartData)
      setQuantity(cart.reduce((acum, item) => acum + item.quantity, 0))
    })

    const cartData = getStorage("cart", true) || []

    if(!sync){
      setCart(cartData)
      setSync(true)
    }

    setQuantity(cartData.reduce((acum, item) => acum + item.quantity, 0))
  }, [loading, cart, sync])

  const updateCart = (cart) => {
    setCart(cart)
    setStorage("cart", cart, true)
    if(hasUser){
      setDoc(doc(db, "carts", AuthUser.id), { cart: cart })
    }
  }

  const addToCart = (id) => {
    const item = cart.find((todo) => todo.id === id)
    if (item) {
      const updatedCart = cart.map((todo) => {
        if (todo.id === id) return { ...todo, quantity: todo.quantity+1 }
        return todo
      })
      updateCart(updatedCart)
    } else {
      updateCart([...cart, { id: id, quantity: 1 }])
    }
  }

  const isItemInCart = (id) => {
    const item = cart.find((todo) => todo.id === id)
    if (item) return true
    return false
  }

  const removeFromCart = (id, byOne = 0) => {
    const item = cart.find((todo) => todo.id === id)
    if (!item) return
    if (byOne) {
      if (item.quantity === 1) return
      const updatedCart = cart.map((todo) => {
        if (todo.id === id) {
          return { ...todo, quantity: todo.quantity - 1 }
        }
        return todo
      })
      updateCart(updatedCart)
    } else {
      const updatedCart = cart.filter((todo) => todo.id !== id)
      updateCart(updatedCart)
    }
  }

  const clearCart = () => {
    updateCart([], true)
  }

  const checkoutSession = async () => {
    const q = query(collection(db, "userShipmentAddresses"), where('id', "==", AuthUser.id), limit(1))
    const querySnapshot = await getDocs(q)
    const data = querySnapshot.docs.map(doc => doc.data())

    if(data.length === 0){
      router.push("/dashboard/account?return=true")
      return
    }

    fetch("/api/stripe/session", { method: 'POST', body: JSON.stringify({ cart: cart }) })
      .then(response => response.json())
      .then(response => {
        window.location.href = response.session.url
      })
  }

  return (
    <CartContext.Provider value={{
      quantity,
      cart,

      clearCart,
      addToCart,
      removeFromCart,
      isItemInCart,

      checkoutSession
    }}>
      {children}
    </CartContext.Provider>
  )
}