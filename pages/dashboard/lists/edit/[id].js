import { useContext, useEffect, useState } from 'react'

import {
  AuthAction,
  useAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'

import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'

import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'

import { MainLayout } from '@/components/Layout'

import { ListContext, useExtraInfoModal } from '@/features/lists'

import { CartContext } from '@/features/carts'

import { addUserSchema, addIdeaSchema } from '@/features/lists/schemas'

const ManageList = () => {
  const router = useRouter()
  const AuthUser = useAuthUser()

  const { id } = router.query || null

  const { isItemInCart, addToCart } = useContext(CartContext)
  const { lists, toggleItemList, switchToAnotherList, addUser, removeUser, editUser, changeListPrivacy, deleteList, addIdeaToList, dataLoading } = useContext(ListContext)

  const { toggleExtraInfoModal, ExtraInfoModal } = useExtraInfoModal()

  const [ listData, setListData ] = useState([])
  const [ loading, setLoading ] = useState(true)
  const [ productsInfo, setProductsInfo ] = useState([])
  const [ userListPermission, setUserListPermission ] = useState()

  const { register, handleSubmit, reset, watch } = useForm({
    resolver: yupResolver(addUserSchema)
  })
  const permissionWatcher = watch("permission")

  const { register: register2, handleSubmit: handleSubmit2 } = useForm({
    resolver: yupResolver(addIdeaSchema)
  })

  useEffect(() => {
    if(!id === 0 || dataLoading.lists || dataLoading.listsWithAccess) return

    const asyncFunc = async () => {
      const foundList = lists?.find(v => v.docID === id)

      if(!foundList) return router.push("/dashboard/lists")
      if(foundList.private && foundList.id !== AuthUser.id) return router.push("/dashboard/lists")
      if(foundList.public && !foundList.accessEmails.includes(AuthUser.email)) return router.push("/dashboard/lists")

      const itemIds = foundList.items?.filter((item) => item.itemID !== null).map((item) => {
        return item.itemID
      })

      const func = async () => {
        itemIds && await fetchData(itemIds)
        setLoading(false)
      }
      func()

      setUserListPermission(foundList.id === AuthUser.id ? 3 : foundList.access.find(v => v.email === AuthUser.email)?.permission ? 2 : 1)
      setListData(foundList)
    }
    asyncFunc()
  }, [id, lists, dataLoading])

  const fetchData = async (data) => {
    fetch("/api/products/products", {
      method: "POST",
      body: JSON.stringify(data)
    })
    .then((response) => response.json())
    .then((data) => {
      const newData = data.data
      setProductsInfo(newData)
    })
  }

  const onSubmit = async ({ email, permission }) => {
    addUser(id, email, permission)
  }

  const [ editingUser, setEditingUser ] = useState(null)
  const [ userPermission, setUserPermission ] = useState(false)

  const updateUser = async (user) => {
    editUser(id, user, userPermission)
    setEditingUser(null)
  }

  const [ editingPermission, setEditingPermission ] = useState(false)
  const [ permission, setPermission ] = useState(false)

  const updatePermission = async () => {
    changeListPrivacy(id, permission)
    setEditingPermission(false)
  }

  const hasPermission = (permission) => {
    if(userListPermission >= permission) return true
    return false
  }

  return (
    <MainLayout title={"Amazon Clone - Manage List Info"} description={"Amazon Clone - Manage List Info"}>
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="flex justify-center items-center">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      ) : (
      <>
        <div className="flex flex-col mt-2">
          <h1 className="text-2xl font-semibold">Manage List Info</h1>
          <p className="text-sm text-gray-500">Manage the name and privacy of your list.</p>
        </div>

        <div className="mt-2">
          <h1 className="text-xl font-normal">List Name: <span className='font-semibold'>{listData?.listName}</span></h1>
        </div>

        <div className="mt-2">
          <h1 className="text-xl font-normal">My Permission: {userListPermission} - <span className='font-semibold'>{listData.id === AuthUser.id ? "Owner" : listData?.access?.find(v => v.email === AuthUser.email)?.permission ? "Read & Write" : "View Only"}</span></h1>
        </div>

        {hasPermission(3) &&
          <div className="mt-2">
            <h1 className="text-xl font-normal">Delete List <span onClick={() => deleteList(id)} className='underline text-orange-500 font-normal hover:cursor-pointer ml-2'>Delete</span></h1>
         </div>
        }

        <div className="mt-2">
          <h1 className="text-xl font-normal">List Privacy:{' '}
            {!editingPermission && <span className='font-semibold'>{listData?.private ? "Private" : "Public"}</span>}

            {editingPermission && <input type="checkbox" onChange={() => setPermission(!permission)} className="toggle" checked={permission ? true : false}/>}
            {hasPermission(3) && !editingPermission && <span onClick={() => { setEditingPermission(true); setPermission(listData?.private) }} className='underline text-orange-500 font-normal hover:cursor-pointer ml-2'>Edit</span>}
            {editingPermission && <span onClick={() => updatePermission()} className='underline text-green-400 font-normal hover:cursor-pointer ml-2'>Confirm</span>}
          </h1>
        </div>

        <ExtraInfoModal/>

        <div className="overflow-x-auto mt-2">
          <h1 className="text-xl font-normal">List Items</h1>

          <table className="table w-full text-white">
            <tbody>
              {listData?.items?.map((item, index) => {
                const foundProduct = productsInfo.find(v => v.id === item.itemID)
                const itemInCart = isItemInCart(item.itemID)

                const isAnIdea = item.itemID === null

                return (
                  <tr key={index}>
                    <th>{index + 1}</th>
                    <td><Image height={100} width={100} src={isAnIdea ? "/assets/idea-icon-4.png" : foundProduct?.thumbnail} alt=""/></td>
                    <td>{isAnIdea ? item.name : foundProduct?.name}</td>
                    <td>${foundProduct?.price || 0}</td>
                    <td>
                      {hasPermission(3) && (
                        <div className="dropdown dropdown-bottom">
                          <label tabIndex={0} className="btn btn-sm btn-primary">Move to different list</label>
                          <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-52">
                            {lists.length > 1 ?
                              <>
                                <label className="text-center text-amber-200 underline">Available Lists</label>
                                {lists.map((list, index) => {
                                  if(list.docID === id) return
                                  return (
                                    <li onClick={() => switchToAnotherList(id, list.docID, item.itemID)} key={index}><a>{list.listName}</a></li>
                                  )
                                })}
                              </>
                            :
                              <>
                                <label className="text-center font-semibold text-red-700 underline">No Available Lists</label>
                                <li><Link href="/dashboard/lists">Create a new list to move this item to.</Link></li>
                              </>
                            }
                          </ul>
                        </div>
                      )}
                      {hasPermission(3) && (
                        <>
                          <button onClick={() => toggleExtraInfoModal({extras: item.extras, itemID: item.itemID, listID: id})} className="btn btn-sm btn-info ml-2">Edit</button>
                          <button className="btn btn-sm btn-danger ml-2" onClick={() => toggleItemList(id, item.itemID)}>Delete</button>
                        </>
                      )}
                      {!isAnIdea && <button onClick={() => itemInCart ? null : addToCart(item.itemID)} className={`btn btn-sm ${itemInCart ? 'btn-warning' : 'btn-success'} ml-2`}>{itemInCart ? "In cart" : "Add to Cart"}</button>}
                      <button className={`btn btn-sm btn-accent ml-2`}>Top search results</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {hasPermission(2) &&
          <div className="mt-2">
            <div className="relative p-2 flex-auto">
              <h1 className="text-xl font-normal">Add an idea to the list:</h1>
              <form onSubmit={handleSubmit2(data => addIdeaToList(id, data))}>
                <div className="form-control w-full max-w-xs">
                  <label className="label">
                    <span className="label-text font-semibold text-black">Idea:</span>
                  </label>
                  <input type="text" {...register2("idea")} placeholder="Save an idea, shop for it later." className="input input-bordered w-full max-w-xs" />
                </div>

                <div className="form-control w-full max-w-xs mt-4">
                  <button type="submit" className="btn btn-primary">Add idea</button>
                </div>
              </form>
            </div>
          </div>
        }

        {hasPermission(3) && (<><div className="mt-2">
          <h1 className="text-xl font-normal">Add authorized user:</h1>

          <div className="relative p-2 flex-auto">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-control w-full max-w-xs">
                <label className="label">
                  <span className="label-text font-semibold text-black">User Email:</span>
                </label>
                <input type="text" {...register("email")} placeholder="email@gmail.com" className="input input-bordered w-full max-w-xs" />
              </div>

              <div className="form-control w-full max-w-xs">
                <label className="label cursor-pointer">
                  <input {...register("permission")} type="checkbox" className="toggle" />
                  <span className="label-text">Permission: {!permissionWatcher ? "View Only" : "View & Edit"}</span>
                </label>
              </div>

              <div className="form-control w-full max-w-xs mt-4">
                <button type="submit" className="btn btn-success">Add user</button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-2">
          <h1 className="text-xl font-normal">Authorized users:</h1>

          <div className="overflow-x-auto">
            <table className="table w-full text-white">
              <tbody>
                {listData?.access?.map((user, index) => {
                  return (
                    <tr key={index}>
                      <th>{index + 1}</th>
                      <td>{user.email}</td>
                      <td>
                        {editingUser !== user.email && (user.permission ? "View & Edit" : "View Only")}
                        {editingUser === user.email && <input type="checkbox" onChange={() => setUserPermission(!userPermission)} className="toggle" checked={userPermission ? true : false}/>}
                        {editingUser !== user.email && <span onClick={() => { setEditingUser(user.email); setUserPermission(user.permission) }} className='underline text-orange-500 font-normal hover:cursor-pointer ml-2'>Edit</span>}
                        {editingUser === user.email && <span onClick={() => updateUser(user.email)} className='underline text-green-400 font-normal hover:cursor-pointer ml-2'>Confirm</span>}
                      </td>
                      <td>
                        <button onClick={() => removeUser(id, user.email)} className="btn btn-sm btn-danger">Remove</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div></>)}
      </>)}

    </MainLayout>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})()

export default ManageList
