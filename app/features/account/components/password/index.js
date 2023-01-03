import { useState } from 'react'

import { useAuthUser } from 'next-firebase-auth'

import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import * as Yup from 'yup'

import {
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  updatePassword
} from 'firebase/auth'

const provider = new GoogleAuthProvider()

export const Password = () => {
  const user = useAuthUser()

  const [ successPasswordChange, setSuccessPasswordChange ] = useState(false)
  const [ wrongOldPassword, setWrongOldPassword ] = useState(false)

  const validationSchema = Yup.object().shape({
    oldPassword: Yup.string().required("Old password is required"),
    password: Yup.string().required("Password is required").min(6, "Password must be at least 6 characters"),
    passwordConfirmation: Yup.string()
     .oneOf([Yup.ref('password'), null], 'Passwords must match')
  })

  const { register, handleSubmit, formState } = useForm({ resolver: yupResolver(validationSchema) })
  const { errors } = formState

  const onSubmit = async ({ oldPassword, password}) => {
    const tryUpdate = async () => {
      try{
        await updatePassword(AuthUser.firebaseUser, password)
        setSuccessPasswordChange(true)
      }catch(err){
        if(err.code === "auth/requires-recent-login"){
          tryReauthenticate()
        }else{
          console.log('error', err)
        }
      }
    }

    const tryReauthenticate = async () => {
      switch(AuthUser.firebaseUser.providerData[0].providerId){
        case 'google.com':
          try{
            await reauthenticateWithPopup(AuthUser.firebaseUser, provider)
            tryUpdate()
          }catch(err){
            console.log('error', err)
          }

          break
        case 'password':
          try{
            const authCredential = EmailAuthProvider.credential(AuthUser.firebaseUser.email, oldPassword)
            await reauthenticateWithCredential(AuthUser.firebaseUser, authCredential)

            tryUpdate()
          }catch(err){
            if(err.code === "auth/wrong-password"){
              setWrongOldPassword(true)
            }
          }
          break
      }
    }
    tryUpdate()
  }

  return (
    <div>
      <h1>Password Change</h1>

      {successPasswordChange && <p className='text-green-500 text-sm font-semibold'>Password changed successfully</p>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col text-sm rounded-md">
          {user?.firebaseUser?.providerData[0]?.providerId !== 'password' &&
            <label htmlFor="email">
              <p className="font-medium text-slate-700 pb-2">Old Password</p>
              <input {...register("oldPassword")} type="password" autoComplete='current-password' className="w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow" placeholder="Enter your password"/>
              {errors.oldpassword?.message && <span className='text-red-500 text-sm font-semibold'>{errors.oldpassword.message}</span>}
              {wrongOldPassword && <span className='text-red-500 text-sm font-semibold'>Wrong old password.</span>}
            </label>
          }
          <label htmlFor="email">
            <p className="font-medium text-slate-700 pb-2">New Password</p>
            <input {...register("password")} type="password" autoComplete='new-password' className="w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow" placeholder="Enter your password"/>
            {errors.password?.message && <span className='text-red-500 text-sm font-semibold'>{errors.password.message}</span>}
          </label>
          <label htmlFor="password">
            <p className="font-medium text-slate-700 pb-2 mt-4">Confirm new password</p>
            <input {...register("passwordConfirmation")} autoComplete='new-password' type="password" className="w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow" placeholder="Confirm your password"/>
            {errors.passwordConfirmation?.message && <span className='text-red-500 text-sm font-semibold'>{errors.passwordConfirmation.message}</span>}
          </label>
        </div>

        <button className="mt-5 w-full border p-2 bg-gradient-to-r from-gray-800 bg-gray-500 text-white rounded-[4px] hover:bg-slate-400 scale-105 duration-300" type="submit">
          Update password
        </button>
      </form>
    </div>
  )
}

