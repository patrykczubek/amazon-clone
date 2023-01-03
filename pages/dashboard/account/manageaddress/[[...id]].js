import { useEffect, useState } from 'react'

import {
  AuthAction,
  useAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'

import { useRouter } from 'next/router'

import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'

import { db } from '@/utils/firebase'
import { doc, getDoc } from '@firebase/firestore'

import { MainLayout } from '@/components/Layout'
import { validationSchema } from '@/features/account'
import { updateAddress } from '@/features/account'
import {
  shippingAddressFormFields,
  billingAddressFormFields
} from '@/features/account/schemas/address'

const ManageAddress = () => {
  const router = useRouter()
  const AuthUser = useAuthUser()

  const [ loading, setLoading ] = useState(true)
  const [ editingAddress, setEditingAddress ] = useState()

  const { register, handleSubmit, formState, reset, watch } = useForm({
    defaultValues: {
      billingSameAsShipping: true,
      defaultAddress: true
    },
    resolver: yupResolver(validationSchema)
  })
  const { errors } = formState

  const watchCheckbox = watch('billingSameAsShipping')

  useEffect(() => {
    if(!AuthUser.clientInitialized) return

    const id = router.query?.id?.[0] || null
    if(id){
      const func = async () => {
        const addressInfoRef = doc(db, "userShipmentAddresses", id)
        const addressInfoSnap = await getDoc(addressInfoRef)
        if(!addressInfoSnap.exists()){
          return router.push("/dashboard/account/manageaddress")
        }

        const addressInfo = addressInfoSnap.data()

        const userInfoRef = doc(db, "users", AuthUser.id)
        const userInfoSnapshot = await getDoc(userInfoRef)
        const userData = userInfoSnapshot.data()

        const { billingAddress } = addressInfo
        const { billingSameAsShipping } = addressInfo

        let defaultValues = {
          ...addressInfo.shippingAddress,
          name: addressInfo.name,
          phoneNumber: addressInfo.phoneNumber,
          billingAddress: billingAddress,
          billingSameAsShipping: billingSameAsShipping,
          defaultAddress: userData?.defaultAddress === id
        }
        reset({...defaultValues})
        setLoading(false)
      }
      func()
    }else{
      setLoading(false)
    }
    setEditingAddress(id)
  }, [router.query, AuthUser])

  return (
    <MainLayout title={"Amazon Clone - Manage Addresses"} description={"Amazon Clone - Manage Addresses"}>
      {loading ? <div>Loading data...</div> :
      <div className="h-screen bg-gray-400">
        <h1>Shipping Address</h1>

        <form onSubmit={handleSubmit(data => updateAddress(editingAddress, data))}>
          <div className="flex flex-col text-sm rounded-md">
            {Object.keys(shippingAddressFormFields).map((key, index) => {
              const { name, type } = shippingAddressFormFields[key]

              return (
                <div key={index}>
                  <label htmlFor={key}>
                    <p className="font-medium text-slate-700 pb-2">{name}</p>
                    <input {...register(key)} type={type} className="w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow" placeholder={name}/>
                    {errors[key]?.message && <span className='text-red-500 text-sm font-semibold'>{errors[key]?.message}</span>}
                  </label>
                </div>
              )
            })}

            <div className="flex items-center mb-4">
              <input {...register("defaultAddress")} type="checkbox" className="w-4 h-4 mt-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
              <label htmlFor="default-checkbox" className="ml-2 mt-4 text-sm font-medium text-gray-900 dark:text-gray-300">Make this my default address</label>
            </div>

            <div className="flex items-center mb-4">
              <input {...register("billingSameAsShipping")} type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
              <label htmlFor="default-checkbox" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Billing address same as shipping address</label>
            </div>

            {!watchCheckbox && Object.keys(billingAddressFormFields).map((key, index) => {
              const { name, type } = billingAddressFormFields[key]

              return (
                <div key={index}>
                  <label htmlFor={key}>{key}
                    <p className="font-medium text-slate-700 pb-2">{name}</p>
                    <input {...register(`billingAddress.${key}`)} type={type} className="w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow" placeholder={name}/>
                    {errors?.billingAddress?.[key]?.message && <span className='text-red-500 text-sm font-semibold'>{errors?.billingAddress?.[key]?.message}</span>}
                  </label>
                </div>
              )
            })}
          </div>

          <button className="mt-5 w-full border p-2 bg-gradient-to-r from-gray-800 bg-gray-500 text-white rounded-[4px] hover:bg-slate-400 scale-105 duration-300" type="submit">
            {editingAddress ? "Update address" : "Add new address"}
          </button>
        </form>
      </div>}
    </MainLayout>
  )

}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})()

export default ManageAddress
