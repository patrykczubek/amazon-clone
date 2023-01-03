import { useState } from 'react'

import {
  AuthAction,
  withAuthUser,
  withAuthUserTokenSSR
} from 'next-firebase-auth'

import { auth, db } from '@/utils/firebase'
import { doc, setDoc, Timestamp } from '@firebase/firestore'

import {
  getAdditionalUserInfo,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup
} from 'firebase/auth'

import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import * as Yup from 'yup'

import { useRouter } from 'next/router'
import Image from 'next/image'

const provider = new GoogleAuthProvider()
provider.setCustomParameters({ prompt: 'select_account' })

const Login = () => {
  const router = useRouter()

  const [ error, setError ] = useState(false)

  const [ inProgress, setInProgress ] = useState(false)

  const handleUser = async (result) => { // insert user logins and location to db
    const { isNewUser } = getAdditionalUserInfo(result)

    if(isNewUser) {
      const docRef = doc(db, "users", result.user.uid)

      setDoc(docRef, {
        createdAt: Timestamp.now(),
        lastLoginAt: Timestamp.now(),
        lastSeenAt: Timestamp.now(),
        photoURL: result.user.photoURL,
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email
      })
     }else{
      const docRef = doc(db, "users", result.user.uid)

      setDoc(docRef, {
        lastLoginAt: Timestamp.now(),
        lastSeenAt: Timestamp.now()
      }, { merge: true })
     }
  }

  const loginWithGmail = () => {
    setInProgress(true)
    signInWithPopup(auth, provider)
      .then(async (result) => {
        handleUser(result)
      }).catch((error) => {
        if(error.code === "auth/popup-closed-by-user") {
          setInProgress(false)
        }else{
          setError(true)
        }
      })
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string().required("Email is required").email("Email is invalid"),
    password: Yup.string().required("Password is required").min(6, "Password must be at least 6 characters"),
  })

  const { register, handleSubmit, reset, formState } = useForm({ resolver: yupResolver(validationSchema) })
  const { errors } = formState

  const onSubmit = async ({email, password}) => {
    setError(false)
    setInProgress(true)
    signInWithEmailAndPassword(auth, email, password)
      .then(async (result) => {
        handleUser(result)
      }).catch((error) => {
        setInProgress(false)
        setError(true)
      })
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-tl from-yellow-600 to-green-600">
      <div className="min-w-fit flex-col border bg-white px-6 py-14 shadow-md rounded-[4px] ">
        <div className="mb-8 flex justify-center">
          <Image src="/assets/logo.png" width={144} height={50} alt="logo" />
        </div>

        {inProgress ? (
          <div role="status">
            Login in progress
            <svg aria-hidden="true" className="mr-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
            <span className="sr-only">Loading...</span>
        </div>
        ) : (
          <>
            {error && <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
              <span className="font-medium">Oops!</span> Change a few things up and try submitting again.
            </div>}

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
              <button className="mt-5 w-full border p-2 bg-gradient-to-r from-gray-800 bg-gray-500 text-white rounded-[4px] hover:bg-slate-400 scale-105 duration-300" type="submit">Sign in</button>
            </form>

            <div className="mt-5 flex justify-between text-sm text-gray-600">
              <button onClick={() => router.push("/auth/forgot-password")}>Forgot password?</button>
              <button onClick={() => router.push("/auth/signup")}>Sign up</button>
            </div>

            <div className="flex justify-center mt-5 text-sm">
              <p className="text-gray-400">or you can sign in with</p>
            </div>

            <div className="my-5">
              <button onClick={() => loginWithGmail()} className="w-full text-center py-3 my-3 border flex space-x-2 items-center justify-center border-slate-200 rounded-lg text-slate-700 hover:border-slate-400 hover:text-slate-900 hover:shadow transition duration-150">
                <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-6 h-6" alt=""/> <span>Login with Google</span>
              </button>
            </div>

            <div className="mt-5 flex text-center text-sm text-gray-400">
              <p>
                This site is protected by reCAPTCHA and the Google <br />
                <a className="underline" href="">Privacy Policy</a>  and <a className="underline" href="">Terms of Service</a>  apply.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}


export const getServerSideProps = withAuthUserTokenSSR({
  whenAuthed: AuthAction.REDIRECT_TO_APP,
})()

export default withAuthUser({
  whenAuthed: AuthAction.REDIRECT_TO_APP,
})(Login)
