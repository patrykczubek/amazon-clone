import { useState, useEffect, useContext } from 'react'
import { withAuthUserTokenSSR, useAuthUser } from 'next-firebase-auth'
import { useRouter } from 'next/router'

import { MainLayout } from '@/components/Layout'
import { CartContext } from '@/features/carts'

import { collection, getDocs } from '@firebase/firestore'
import { db } from '@/utils/firebase'

const Carttest = () => {
  const router = useRouter()
  const AuthUser = useAuthUser()

  const [ allProducts, setAllProducts ] = useState()

  const { addToCart, removeFromCart, cart } = useContext(CartContext)

  useEffect(() => {
    const lol = async () => {
      const docRef = collection(db, "products")
      const docSnap = await getDocs(docRef)

      const data = []

      docSnap.forEach((doc) => {
        data.push({id: doc.id, ...doc.data()})
      })

      setAllProducts(data)
    }

    lol()
  }, [])

  return (
    <MainLayout title={"Amazon Clone - Cart"} description={"Amazon Clone - Cart"}>
      <h1>Cart</h1>

      <div className='flex flex-col items-center justify-center'>
      {allProducts && allProducts.map((product) => {
        const inCart = cart.find((item) => item.id === product.id)
        return (
          <div className='pt-2' key={product.id}>
            <p>{product.name} - <span className='text-orange-400'>${product.price}</span> - {inCart && inCart.quantity}
              {!inCart && <button onClick={() => addToCart(product.id)} className='bg-green-600'>Add to cart</button>}
              {inCart && <button onClick={() => addToCart(product.id)} className='bg-yellow-300 mx-1'>Add more</button>}
              {inCart && <button onClick={() => removeFromCart(product.id, true)} className='bg-red-400 mx-1'>Remove by 1</button>}
              {inCart && <button onClick={() => removeFromCart(product.id)} className='bg-red-600'>Remove from cart</button>}
              <button onClick={() => router.push("/products/"+product.id)} className='mx-1'>GO TO PRODUCT</button>
            </p>
          </div>
        )
      })}
      </div>

    </MainLayout>
  )
}

export const getServerSideProps = withAuthUserTokenSSR()()

export default Carttest

