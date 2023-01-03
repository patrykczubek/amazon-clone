import { useEffect, useState, useContext } from 'react'

import { useAuthUser, withAuthUserTokenSSR } from 'next-firebase-auth'
import { useRouter } from 'next/router'

import Image from 'next/image'

import { MainLayout } from '@/components/Layout'

import { isUserLoading } from '@/features/auth/hooks/isUserLoading'

import { doc, getDoc } from '@firebase/firestore'
import { db } from '@/utils/firebase'

import { ProductsContext } from '@/features/products'

import { Reviews, ProductInfo } from '@/features/products'

const Product = () => {
  const router = useRouter()
  const AuthUser = useAuthUser()

  const { id } = router.query || null

  const { loading, hasUser } = isUserLoading(AuthUser)

  const [ productData, setProductData ] = useState({})

  const [ itemPreviouslyBought, setItemPreviouslyBought ] = useState({ previouslyBought: false, lastPurchased: null})

  const { checkItem, previouslyBought } = useContext(ProductsContext)

  useEffect(() => {
    if(loading || !id) return

    const func = async () => {
      const docRef = doc(db, "products", id)
      const docSnap = await getDoc(docRef)
      const docData = docSnap.data()

      checkItem()

      setProductData(docData)
    }
    func()
  }, [id, hasUser, loading])

  useEffect(() => {
    if(previouslyBought.length === 0) return

    const { time, orderID } = previouslyBought?.find(({items}) => items.includes(id)) || {}
    if(time) setItemPreviouslyBought({ previouslyBought: true, lastPurchased: time, orderID: orderID})
  }, [previouslyBought])

  return (
    <MainLayout title={"Amazon Clone - Cart"} description={"Amazon Clone - Cart"}>
      <div className="flex flex-col">
        {/* <div className="flex flex-col">
          <h1 className="text-xl">Product Name: {productData.name}</h1>
          <h1 className="text-xl">Product Price: ${productData.price}</h1>
          <h1 className="text-xl">Product Description: {productData.description}</h1>
          <h1 className="text-xl">Product Category: {productData.category}</h1>
          <h1 className="text-xl">Product Rating: {productData.rating}</h1>
          <h1 className="text-xl">Product Has Prime: {productData?.hasPrime ? "Yes" : "No"}</h1>
          <h1 className="text-xl">Verified Buyer: {itemPreviouslyBought?.previouslyBought ? "True" : "False"}</h1>
          {itemPreviouslyBought?.previouslyBought && <h1 className="text-xl">Last Purchased: {itemPreviouslyBought?.lastPurchased?.toDate().toDateString()} {itemPreviouslyBought?.lastPurchased?.toDate().toLocaleTimeString()}</h1>}
          {itemPreviouslyBought?.previouslyBought && <h1 className="text-xl">View order: {itemPreviouslyBought.orderID}</h1>}

          <div className="flex mb-2">
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Add to Cart
            </button>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2">
              Add to List
            </button>
            <button className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded ml-2">
              Report Incorrect Product Information
            </button>
          </div>
        </div> */}

        {/* <div className="flex">
          {productData?.thumbnail ? <Image height={80} width={80} src={productData?.thumbnail} alt=""/> :
          <div className="flex justify-center items-center mb-4 h-20 bg-gray-300 rounded dark:bg-gray-700">
            <svg className="w-20 h-20 text-gray-200 dark:text-gray-600" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor" viewBox="0 0 640 512"><path d="M480 80C480 35.82 515.8 0 560 0C604.2 0 640 35.82 640 80C640 124.2 604.2 160 560 160C515.8 160 480 124.2 480 80zM0 456.1C0 445.6 2.964 435.3 8.551 426.4L225.3 81.01C231.9 70.42 243.5 64 256 64C268.5 64 280.1 70.42 286.8 81.01L412.7 281.7L460.9 202.7C464.1 196.1 472.2 192 480 192C487.8 192 495 196.1 499.1 202.7L631.1 419.1C636.9 428.6 640 439.7 640 450.9C640 484.6 612.6 512 578.9 512H55.91C25.03 512 .0006 486.1 .0006 456.1L0 456.1z"/></svg>
          </div>}
        </div> */}

        <ProductInfo productData={productData}/>

        <Reviews previouslyBought={itemPreviouslyBought}/>
      </div>
    </MainLayout>
  )
}

export const getServerSideProps = withAuthUserTokenSSR()()

export default Product

