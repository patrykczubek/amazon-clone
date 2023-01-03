import { useContext, useEffect, useState } from 'react'

import { withAuthUserTokenSSR } from 'next-firebase-auth'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'

import { CartContext } from '@/features/carts'
import { ListContext } from '@/features/lists'

import { MainLayout } from '@/components/Layout'

import { Pagination, ToggleSwitch } from 'flowbite-react'

const Cart = () => {
  const router = useRouter()
  const [ allItemsInfo, setAllItemsInfo ] = useState([])
  const [ price, setPrice ] = useState(0)

  const { cart, addToCart, removeFromCart, quantity, checkoutSession } = useContext(CartContext)
  const { lists, toggleItemList, addToSaveForLater, forLaterList, removeFromForLater } = useContext(ListContext)

  const [ page, setPage ] = useState(1)
  const [ list, setList ] = useState([])
  const [ fetching, setFetching ] = useState(true)
  const [ allPages, setAllPages ] = useState(0)

  const LIMIT = 5

  useEffect(() => {
    if(cart.length === 0){
      setFetching(false)
      setAllPages(0)
      setList([])
      return
    }

    const func = async() => {
      const firstPageItems = cart.slice(page*LIMIT-LIMIT, page*LIMIT)

      const itemIds = cart.map((item) => { return item.id })

      setAllPages(Math.ceil(cart.length/LIMIT))
      setList(firstPageItems)
      fetchData(itemIds)

      if(!firstPageItems.length && page > 1){
        setPage(page-1)
      }
    }

    func()
  }, [cart])

  useEffect(() => {
    if(!forLaterList || forLaterList?.items?.length === 0) return
    fetchData(forLaterList?.items)

  }, [forLaterList])

  useEffect(() => {
    const nextPageItems = cart.slice(page*LIMIT-LIMIT, page*LIMIT)

    setList(nextPageItems)
    setPage(page)
  }, [page])

  const fetchData = async (data) => {
    if(!data) return
    fetch("/api/products/products", {
      method: "POST",
      body: JSON.stringify(data)
    })
    .then((response) => response.json())
    .then((data) => {
      const newData = data.data
      setAllItemsInfo(prevState => [...prevState, ...newData])
      setFetching(false)
    })
  }

  useEffect(() => {
    if(cart.length === 0){
      setPrice(0)
      return
    }

    const newTotal = cart.map((item) => {
      const findItem = allItemsInfo.find(v => v.id === item.id)
      return findItem?.discount ? (findItem?.price-(findItem?.price*(findItem?.discountPercentage/100)))*item?.quantity : findItem?.price*item?.quantity
    }).reduce((prev, next) => prev + next)

    setPrice(newTotal.toFixed(2))
  }, [allItemsInfo, cart])

  const saveForLater = async (item) => {
    const findItem = cart.find(v => v.id === item)

    addToSaveForLater(findItem.id)
  }

  return (
    <MainLayout title={"Amazon Clone - Cart"} description={"Amazon Clone - Cart"}>
      <div className="bg-gray-100">
        <div className="container mx-auto mt-10">
          <div className="flex shadow-md my-10">
            <div className="w-3/4 bg-white px-10 py-10">
              <div className="flex justify-between border-b pb-8">
                <h1 className="font-semibold text-2xl">Shopping Cart</h1>
                <h2 className="font-semibold text-2xl">{quantity} Items</h2>
              </div>

              {quantity > 0 ?
                <div className="flex mt-10 mb-5">
                  <h3 className="font-semibold text-gray-600 text-xs uppercase w-2/5">Product Details</h3>
                  <h3 className="font-semibold text-center text-gray-600 text-xs uppercase w-1/5">Quantity</h3>
                  <h3 className="font-semibold text-center text-gray-600 text-xs uppercase w-1/5">Price</h3>
                  <h3 className="font-semibold text-center text-gray-600 text-xs uppercase w-1/5">Total</h3>
                </div>
              :
                <div className="flex justify-center items-center mt-10 mb-5">
                  <h3 className="font-semibold text-gray-600 text-xs uppercase">Your cart is empty</h3>
                </div>
              }

              {fetching && allItemsInfo.length !== 0 && <div className="flex justify-center items-center mt-10 mb-5">
                <h3 className="font-semibold text-gray-600 text-xs uppercase">Loading...</h3>
              </div>}

              {!fetching && list.length > 0 && allItemsInfo.length !== 0 && list.map((item) => {
                const itemInfo = allItemsInfo.find(v => v.id === item.id)

                return (
                  <div key={item?.id} className="flex items-center hover:bg-gray-100 -mx-8 px-6 py-5">
                    <div className="flex w-2/5">
                      <div className="w-20 h-24">
                        {itemInfo?.thumbnail ? <Image height={80} width={80} src={itemInfo?.thumbnail} alt=""/> :
                          <div class="flex justify-center items-center mb-4 h-48 bg-gray-300 rounded dark:bg-gray-700">
                            <svg class="w-12 h-12 text-gray-200 dark:text-gray-600" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor" viewBox="0 0 640 512"><path d="M480 80C480 35.82 515.8 0 560 0C604.2 0 640 35.82 640 80C640 124.2 604.2 160 560 160C515.8 160 480 124.2 480 80zM0 456.1C0 445.6 2.964 435.3 8.551 426.4L225.3 81.01C231.9 70.42 243.5 64 256 64C268.5 64 280.1 70.42 286.8 81.01L412.7 281.7L460.9 202.7C464.1 196.1 472.2 192 480 192C487.8 192 495 196.1 499.1 202.7L631.1 419.1C636.9 428.6 640 439.7 640 450.9C640 484.6 612.6 512 578.9 512H55.91C25.03 512 .0006 486.1 .0006 456.1L0 456.1z"/></svg>
                        </div>}
                      </div>
                      <div className="flex flex-col justify-between ml-4 flex-grow">
                        <Link href={"/products/"+item.id}>
                          <a className="font-bold text-sm hover:underline">{itemInfo?.name}</a>
                        </Link>
                        <span className="text-red-500 text-xs">{itemInfo?.brand}</span>
                        <div className="flex flex-wrap">
                          <a onClick={() => removeFromCart(item?.id)} className="font-semibold hover:text-red-500 text-gray-500 text-xs cursor-pointer">Remove</a>
                          <a onClick={() => saveForLater(item?.id)} className="font-semibold hover:text-red-500 text-gray-500 text-xs cursor-pointer ml-2">Save for later</a>
                          <div className="dropdown dropdown-right dropdown-end font-semibold text-xs cursor-auto">
                            <label tabIndex={0} className="ml-2">Add to list</label>
                            <div tabIndex={0} className="dropdown-content card card-compact w-64 p-2 shadow bg-gray-600 text-primary-content">
                              <div className="card-body">
                                <div className="form-control w-52">
                                  <label className="label">Your lists</label>
                                  {lists.length > 0 && lists.map((list) => {
                                    return (
                                      <div key={list?.docID} className='flex flex-row'>
                                        <ToggleSwitch
                                          key={list?.docID}
                                          checked={list?.items?.find(v => v.itemID === item.id) ? true : false}
                                          label={list?.name}
                                          onChange={() => toggleItemList(list.docID, item.id)}
                                        />
                                        <div className="inline-grid">
                                          <label className="cursor-pointer">List: {list?.listName}</label>
                                          <label className="text-xs text-gray-400">Privacy: {list?.private ? "Private" : "Public"}</label>
                                        </div>
                                    </div>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center w-1/5">
                      <svg onClick={() => removeFromCart(item?.id, true)} className="cursor-pointer hover:fill-red-600 fill-current text-gray-600 w-3" viewBox="0 0 448 512"><path d="M416 208H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h384c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"/></svg>
                      <input readOnly className="mx-2 border text-center w-10" type="text" value={item?.quantity}/>
                      <svg onClick={() => addToCart(item?.id)} className="cursor-pointer hover:fill-green-600 fill-current text-gray-600 w-3" viewBox="0 0 448 512"> <path d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"/></svg>
                    </div>
                    <span className="text-center w-1/5 font-semibold text-sm">${itemInfo?.price}</span>
                    <span className="text-center w-1/5 font-semibold text-sm">${itemInfo?.price*item?.quantity}</span>
                  </div>
                )
              })}

              {!fetching && list.length > 0 && allItemsInfo.length !== 0 && <div className="flex flex-col items-center">
                <span className="text-sm text-gray-700 dark:text-gray-400">
                  Showing
                  <span className="font-semibold text-gray-900 dark:text-white"> {page*LIMIT-LIMIT+1}</span> to
                  <span className="font-semibold text-gray-900 dark:text-white"> {Math.min(page * LIMIT, allItemsInfo.length)}</span> of
                  <span className="font-semibold text-gray-900 dark:text-white"> {cart.length}</span> Entries
                </span>
                <div className="mt-4">
                  <Pagination
                    currentPage={page}
                    layout="pagination"
                    onPageChange={(page) => setPage(page)}
                    showIcons={true}
                    totalPages={allPages}
                    previousLabel="Previous"
                    nextLabel="Next"
                  />
                </div>
              </div>}

              <Link href="/">
                <a href="/" className="flex font-semibold text-indigo-600 text-sm mt-6">
                  <svg className="fill-current mr-2 text-indigo-600 w-4" viewBox="0 0 448 512"><path d="M134.059 296H436c6.627 0 12-5.373 12-12v-56c0-6.627-5.373-12-12-12H134.059v-46.059c0-21.382-25.851-32.09-40.971-16.971L7.029 239.029c-9.373 9.373-9.373 24.569 0 33.941l86.059 86.059c15.119 15.119 40.971 4.411 40.971-16.971V296z"/></svg>
                  Continue Shopping
                </a>
              </Link>
            </div>

            <div className="w-1/4 px-8 py-10">
              <h1 className="font-semibold text-2xl border-b pb-8">Order Summary</h1>
              <div className="flex justify-between mt-10 mb-5">
                <span className="font-semibold text-sm uppercase">{quantity} Items</span>
                <span className="font-semibold text-sm">${price}</span>
              </div>
              <div>
                <label className="font-medium inline-block mb-3 text-sm uppercase">Shipping</label>
                <p className="font-semibold text-xs">Calculated during checkout</p>
              </div>
              <div className="py-5">
                <label htmlFor="promo" className="font-semibold inline-block mb-3 text-sm uppercase">Promo Code</label>
                <input disabled={quantity === 0 ? true : ""} type="text" id="promo" placeholder="Enter your code" className={`${quantity === 0 ? 'opacity-25 cursor-not-allowed' : ''} p-2 text-sm w-full`}/>
              </div>
              <button className={`${quantity === 0 ? 'opacity-25 cursor-not-allowed' : ''} bg-red-500 hover:bg-red-600 px-5 py-2 text-sm text-white uppercase`}>Apply</button>
              <div className="border-t mt-4">
                <div className="flex font-semibold justify-between py-6 text-sm uppercase">
                  <span>Total cost</span>
                  <span>${price}</span>
                </div>
                <button onClick={checkoutSession} className={`${quantity === 0 ? 'opacity-25 cursor-not-allowed' : ''} bg-indigo-500 font-semibold hover:bg-indigo-600 py-3 text-sm text-white uppercase w-full`}>Proceed to checkout</button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10">
          <h1 className="text-3xl font-semibold">Save for later items</h1>

          {forLaterList?.items?.length > 0 && forLaterList.items.map((item, i) => {
            const itemInfo = allItemsInfo.find((itemInfo) => itemInfo.id === item)
            return (
              <div key={i} className="flex items-center bg-white dark:bg-gray-800 my-6 p-4 rounded-lg shadow-md">
                <div className="w-20 h-24">
                  <Image height={80} width={80} src={itemInfo?.thumbnail} alt=""/>
                </div>
                <div className="flex flex-col justify-between ml-4 flex-grow">
                  <span className="font-bold text-sm">{itemInfo?.name}</span>
                  <span className="text-red-500 text-xs">{itemInfo?.brand}</span>
                </div>
                <div className=" ">
                  <a onClick={() => { addToCart(item); removeFromForLater(item) }} className="font-semibold hover:text-red-500 text-gray-500 text-xs cursor-pointer">Add To cart</a>
                  <a onClick={() => { removeFromForLater(item) }} className="font-semibold hover:text-red-500 text-gray-500 text-xs cursor-pointer ml-2">Remove from Save for Later</a>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </MainLayout>
  )
}

export const getServerSideProps = withAuthUserTokenSSR()()

export default Cart

