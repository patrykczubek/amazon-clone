import { useState } from 'react'

import {
  AuthAction,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'

import { auth, db } from '@/utils/firebase'
import { doc, setDoc, Timestamp } from '@firebase/firestore'

import {
  createUserWithEmailAndPassword,
  getAdditionalUserInfo
} from 'firebase/auth'

import { yupResolver } from '@hookform/resolvers/yup'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import * as Yup from 'yup'

import Image from 'next/image'

const Signup = () => {
  const router = useRouter()

  const handleUser = async (result) => {
    const { isNewUser } = getAdditionalUserInfo(result)
    if(isNewUser) {
      const docRef = doc(db, "users", result.user.uid)

      setDoc(docRef, {
        email: result.user.email,
        createdAt: Timestamp.now(),
        emailVerified: result.user.emailVerified,
        lastLoginAt: Timestamp.now(),
        lastSeenAt: Timestamp.now(),
        photoURL: result.user.photoURL,
        uid: result.user.uid,
        displayName: result.user.displayName
      })
     }else{
      const docRef = doc(db, "users", result.user.uid)
      setDoc(docRef, {
        lastLoginAt: Timestamp.now(),
        lastSeenAt: Timestamp.now()
      }, { merge: true })
     }
  }

  const validationSchema = Yup.object().shape({
    email: Yup.string().required("Email is required").email("Email is invalid"),
    password: Yup.string().required("Password is required").min(6, "Password must be at least 6 characters"),
  })

  const { register, handleSubmit, formState } = useForm({ resolver: yupResolver(validationSchema) })
  const { errors } = formState
  const [ error, setError ] = useState(false)

  const onSubmit = async ({email, password}) => { // add user name
    setError(false)
    createUserWithEmailAndPassword(auth, email, password).then(async (result) => {
      handleUser(result)
    }).catch((error) => {
      setError(error)
    })
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-tl from-yellow-600 to-green-600">
      <div className="min-w-fit flex-col border bg-white px-6 py-14 shadow-md rounded-[4px] ">
        <div className="mb-8 flex justify-center">
          <Image src="/assets/logo.png" width={144} height={50} alt="logo" />
        </div>

        {error?.code &&
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
            <span className="font-medium">Oops!</span> {error.code === "auth/email-already-in-use" ? "Email already in use." : "Change a few things up and try submitting again."}
          </div>
        }

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col text-sm rounded-md">
            <label htmlFor="email">
              <p className="font-medium text-slate-700 pb-2">Email address</p>
              <input {...register("email")} type="email" autoComplete="on" className="w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow" placeholder="Enter email address"/>
              {errors.email?.message && <span className='text-red-500 text-sm font-semibold'>{errors.email.message}</span>}
            </label>
            <label htmlFor="password">
              <p className="font-medium text-slate-700 pb-2 mt-4">Password</p>
              <input {...register("password")} type="password" autoComplete="on" className="w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow" placeholder="Enter your password"/>
              {errors.password?.message && <span className='text-red-500 text-sm font-semibold'>{errors.password.message}</span>}
            </label>
          </div>

          <button className="mt-5 w-full border p-2 bg-gradient-to-r from-gray-800 bg-gray-500 text-white rounded-[4px] hover:bg-slate-400 scale-105 duration-300" type="submit">
            Sign up
          </button>
        </form>

        <div className="mt-5 flex justify-between text-sm text-gray-600">
          <button onClick={() => router.push("/auth/login")}>Already have an account? Login here</button>
        </div>

        <div className="flex justify-center mt-5 text-sm">
          <p className="text-gray-400">or you can sign up with</p>
        </div>

        <div className="my-5">
          <button className="w-full text-center py-3 my-3 border flex space-x-2 items-center justify-center border-slate-200 rounded-lg text-slate-700 hover:border-slate-400 hover:text-slate-900 hover:shadow transition duration-150">
            <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-6 h-6" alt=""/> <span>Signup with Google</span>
          </button>
        </div>

        <div className="mt-5 flex text-center text-sm text-gray-400">
          <p>
            This site is protected by reCAPTCHA and the Google <br />
            <a className="underline" href="">Privacy Policy</a>  and <a className="underline" href="">Terms of Service</a>  apply.
          </p>
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenAuthed: AuthAction.REDIRECT_TO_APP,
})()

export default withAuthUser({
  whenAuthed: AuthAction.REDIRECT_TO_APP,
})(Signup)
