import {
  AuthAction,
  withAuthUserTokenSSR
} from 'next-firebase-auth'

import { useState } from 'react'

import { auth } from '@/utils/firebase'

import { sendPasswordResetEmail } from 'firebase/auth'

import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import * as Yup from 'yup'

import { useRouter } from 'next/router'
import Image from 'next/image'

const ForgotPassword = () => {
  const router = useRouter()

  const validationSchema = Yup.object().shape({
    email: Yup.string().required("Email is required").email("Email is invalid"),
  })

  const { register, handleSubmit, reset, formState } = useForm({ resolver: yupResolver(validationSchema) })
  const { errors } = formState

  const [ error, setError ] = useState(false)
  const [ success, setSuccess ] = useState(false)

  const onSubmit = async ({email}) => {
    try{
      const response = await sendPasswordResetEmail(auth, email)
      setSuccess(true)
    }catch(error){
      if(error.code === "auth/user-not-found"){
        setError(error)
      }else{
        setError(true)
      }
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-tl from-yellow-600 to-green-600">
      <div className="min-w-fit flex-col border bg-white px-6 py-14 shadow-md rounded-[4px] ">
        <div className="mb-8 flex justify-center">
          <Image src="/assets/logo.png" width={144} height={50} alt="logo" />
        </div>

        {error && <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
          <span className="font-medium">Oops!</span> {error?.code === "auth/user-not-found" ? "User not found." : "Change a few things up and try submitting again."}
        </div>}

        {!success ? (
          <>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col text-sm rounded-md">
                <label htmlFor="email">
                  <p className="font-medium text-slate-700 pb-2">Email address</p>
                  <input {...register("email")} type="email" className="w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow" placeholder="Enter email address"/>
                  {errors.email?.message && <span className='text-red-500 text-sm font-semibold'>{errors.email.message}</span>}
                </label>
              </div>

              <button className="mt-5 w-full border p-2 bg-gradient-to-r from-gray-800 bg-gray-500 text-white rounded-[4px] hover:bg-slate-400 scale-105 duration-300" type="submit">
                Reset your password
              </button>
            </form>

            <div className="mt-5 flex justify-between text-sm text-gray-600">
              <button onClick={() => router.push("/auth/login")}>Login</button>
              <button onClick={() => router.push("/auth/signup")}>Sign up</button>
            </div>

            <div className="mt-5 flex text-center text-sm text-gray-400">
              <p>
                This site is protected by reCAPTCHA and the Google <br />
                <a className="underline" href="">Privacy Policy</a>  and <a className="underline" href="">Terms of Service</a>  apply.
              </p>
            </div>
          </>
        ) : (
          <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800" role="alert">
            <span className="font-medium">Success!</span> Check your email for a link to reset your password. If it doesn’t appear within a few minutes, check your spam folder.
          </div>
        )}

      </div>
    </div>
  )
}


export const getServerSideProps = withAuthUserTokenSSR({
  whenAuthed: AuthAction.REDIRECT_TO_APP,
})()

export default ForgotPassword
