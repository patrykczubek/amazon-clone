import { useEffect, useState } from 'react'

import { useAuthUser, withAuthUserTokenSSR } from 'next-firebase-auth'
import { useRouter } from 'next/router'

import Link from 'next/link'
import Image from 'next/image'

import { MainLayout } from '@/components/Layout'

import { isUserLoading } from '@/features/auth/hooks/isUserLoading'

import { doc, getDoc } from '@firebase/firestore'
import { db } from '@/utils/firebase'

const Order = () => {
  const router = useRouter()
  const AuthUser = useAuthUser()

  const { id } = router.query || null

  const { loading, hasUser } = isUserLoading(AuthUser)

  const [ orderData, setOrderData ] = useState({})
  const [ allItemsInfo, setAllItemsInfo ] = useState([])

  useEffect(() => {
    if(loading || !id) return

    if(hasUser){
      const func = async () => {
        const docRef = doc(db, "orders", id)
        const docSnap = await getDoc(docRef)
        const docData = docSnap.data()

        const itemIds = [].concat(...docData.items.map(item => item.id))

        setOrderData(docSnap.data())

        fetchData(itemIds)
      }
      func()
    }
  }, [id, hasUser, loading])

  const fetchData = async (data) => {
    if(!data) return
    fetch("/api/products/products", {
      method: "POST",
      body: JSON.stringify(data)
    })
    .then((response) => response.json())
    .then((data) => {
      const newData = data.data
      setAllItemsInfo(newData)
    })
  }

  return (
    <MainLayout title={"Amazon Clone - Cart"} description={"Amazon Clone - Cart"}>
      <div className="flex flex-col ">
        <h1 className="text-2xl font-bold">Order Info</h1>

        <div className="flex flex-col mt-4">
          {orderData && allItemsInfo.length > 0 && (
            <div className="flex flex-col">
              <div className="flex flex-col">
                <h1 className="text-sm">Order ID: {orderData.orderID}</h1>
                <h1 className="text-sm">Order Date: {orderData.time.toDate().toDateString()} {orderData.time.toDate().toLocaleTimeString()}</h1>
                <h1 className="text-sm">Order Total: ${orderData.total}</h1>
              </div>
              <div className="flex flex-col mt-4">
                <h1 className="text-xl font-bold">Items</h1>
                <div className="flex flex-col mt-4">
                  {orderData.items && orderData.items.map((item, index) => {
                    const itemInfo = allItemsInfo.find(itemInfo => itemInfo?.id === item.id)

                    return (
                      <div key={index} className="flex flex-row">
                        <div className="flex flex-col">
                          {itemInfo?.thumbnail ? <Image height={80} width={80} src={itemInfo?.thumbnail} alt=""/>
                          : <div class="flex justify-center items-center mb-4 h-20 w-20 bg-gray-300 rounded dark:bg-gray-700">
                            <svg class="w-20 h-20 text-gray-200 dark:text-gray-600" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor" viewBox="0 0 640 512"><path d="M480 80C480 35.82 515.8 0 560 0C604.2 0 640 35.82 640 80C640 124.2 604.2 160 560 160C515.8 160 480 124.2 480 80zM0 456.1C0 445.6 2.964 435.3 8.551 426.4L225.3 81.01C231.9 70.42 243.5 64 256 64C268.5 64 280.1 70.42 286.8 81.01L412.7 281.7L460.9 202.7C464.1 196.1 472.2 192 480 192C487.8 192 495 196.1 499.1 202.7L631.1 419.1C636.9 428.6 640 439.7 640 450.9C640 484.6 612.6 512 578.9 512H55.91C25.03 512 .0006 486.1 .0006 456.1L0 456.1z"/></svg>
                          </div>}
                        </div>
                        <div className="flex flex-col ml-4">
                          <h1 className="text-xl font-bold">{itemInfo?.title}</h1>
                          <p className="text-sm">Item: {itemInfo?.name}</p>
                          <p className="text-sm">Price: ${item.price/100}</p>
                          <p className="text-sm">Quantity: {item.quantity}</p>
                          <p className="text-sm">Item ID: {itemInfo?.id}</p>
                          <div className="flex flex-row mt-4">
                            <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
                              <span>Track Package</span>
                            </button>
                            <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center ml-4">
                              <span>Return or Replace Item</span>
                            </button>
                            <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center ml-4">
                              <span>Share Gift Receipt</span>
                            </button>
                            <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center ml-4">
                              <span>Leave Seller Feedback</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}

export const getServerSideProps = withAuthUserTokenSSR()()

export default Order

