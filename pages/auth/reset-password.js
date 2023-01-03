import { useEffect, useState } from 'react'

import {
  AuthAction,
  withAuthUserTokenSSR
} from 'next-firebase-auth'

import { auth } from '@/utils/firebase'

import {
  confirmPasswordReset,
  verifyPasswordResetCode
} from 'firebase/auth'

import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import * as Yup from 'yup'

import { useRouter } from 'next/router'
import Image from 'next/image'

const ResetPassword = () => { // insert all password resets and confirmations to db
  const router = useRouter()
  const { oobCode } = router.query

  const validationSchema = Yup.object().shape({
    password: Yup.string().required("Password is required").min(6, "Password must be at least 6 characters"),
    passwordConfirmation: Yup.string()
     .oneOf([Yup.ref('password'), null], 'Passwords must match')
  })

  const { register, handleSubmit, reset, formState } = useForm({ resolver: yupResolver(validationSchema) })
  const { errors } = formState

  const [ success, setSuccess ] = useState(false)
  const [ error, setError ] = useState(false)

  const onSubmit = async ({password}) => {
    try{
      await confirmPasswordReset(auth, oobCode, password)
      setSuccess(true)
    }catch(err){
      console.log('error', err)
    }
  }

  useEffect(() => {
    if(oobCode){
      verifyPasswordResetCode(auth, oobCode).catch(() => {
        setError(true)
      })
    }
  }, [oobCode])

  return (
    <div class="flex items-center justify-center h-screen bg-gradient-to-tl from-yellow-600 to-green-600">
      <div class="min-w-fit flex-col border bg-white px-6 py-14 shadow-md rounded-[4px] ">
        <div class="mb-8 flex justify-center">
          <Image src="/assets/logo.png" width={144} height={50} alt="logo" />
        </div>

        {error && (
          <div class="flex flex-col text-sm rounded-md">
            <p class="font-medium text-slate-700 pb-2 text-center">The link you used is invalid or has expired.</p>
            <p class="font-medium text-slate-700 pb-2 text-center">Please request a new password reset link.</p>
            <button className='' onClick={() => router.push("/forgot-password")}>Redirect to forgot password</button>
          </div>
        )}

        {!error && (
          !success ? (
            <form onSubmit={handleSubmit(onSubmit)}>
            <div class="flex flex-col text-sm rounded-md">
              <label for="email">
                <p class="font-medium text-slate-700 pb-2">Password</p>
                <input {...register("password")} type="password" class="w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow" placeholder="Enter your password"/>
                {errors.password?.message && <span className='text-red-500 text-sm font-semibold'>{errors.password.message}</span>}
              </label>
              <label for="password">
                <p class="font-medium text-slate-700 pb-2 mt-4">Confirm password</p>
                <input {...register("passwordConfirmation")} type="password" class="w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow" placeholder="Confirm your password"/>
                {errors.passwordConfirmation?.message && <span className='text-red-500 text-sm font-semibold'>{errors.passwordConfirmation.message}</span>}
              </label>
            </div>

            <button class="mt-5 w-full border p-2 bg-gradient-to-r from-gray-800 bg-gray-500 text-white rounded-[4px] hover:bg-slate-400 scale-105 duration-300" type="submit">
              Reset your password
            </button>
          </form>
          ) : (
            <div class="flex flex-col text-sm rounded-md">
              <p class="font-medium text-slate-700 pb-2 text-center">Your password has been reset,</p>
              <p class="font-medium text-slate-700 pb-2 text-center">you can now login with your new password.</p>
              <button className='' onClick={() => router.push("/auth/login")}>Redirect to login</button>
            </div>
          )
        )}
      </div>
    </div>
  )
}


export const getServerSideProps = withAuthUserTokenSSR({
  whenAuthed: AuthAction.REDIRECT_TO_APP,
})()

export default ResetPassword
