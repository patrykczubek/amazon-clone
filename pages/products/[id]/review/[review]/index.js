import { useEffect, useState } from 'react'

import { useAuthUser, withAuthUserTokenSSR } from 'next-firebase-auth'
import { useRouter } from 'next/router'

import Image from 'next/image'

import { arrayUnion, doc, getDoc, setDoc } from '@firebase/firestore'
import { db } from '@/utils/firebase'

import { MainLayout } from '@/components/Layout'
import Zoom from 'react-medium-image-zoom'

const ReviewInfo = () => {
  const router = useRouter()
  const AuthUser = useAuthUser()

  const { id, review } = router.query || {}

  const [ reviewInfo, setReviewInfo ] = useState(null)
  const [ reactions, setReactions ] = useState({ like: 0, dislike: 0 })

  useEffect(() => {
    const func = async () => {
      const reviewDocRef = doc(db, "products", id, 'reviews', review)
      const reviewDocSnap = await getDoc(reviewDocRef)
      if(!reviewDocSnap.exists()){
        router.push(`/products/${id}`)
        return
      }

      const reviewDocData = reviewDocSnap.data()

      const userDocRef = doc(db, "users", reviewDocData.id)
      const userDocSnap = await getDoc(userDocRef)
      const userDocData = userDocSnap.data()

      setReviewInfo({...reviewDocData, userDocData})
      setReactions({...(reviewDocData.reactions || { like: 0, dislike: 0, users: [] })})
    }
    func()
  }, [])

  const like = () => {
    const checkIfUserLikedOrDisliked = reactions?.users?.find((user) => user.id === AuthUser.id)
    const docRef = doc(db, "products", id, "reviews", review)

    if (checkIfUserLikedOrDisliked?.type === "dislike") {
      const updatedUsers = reactions.users.map((user) => {
        if (user.id === AuthUser.id) {
          return {
            ...user,
            type: "like"
          }
        }
        return user
      })
      setReactions({...reactions, like: reactions.like+1, dislike: reactions.dislike-1, users: updatedUsers })
      setDoc(docRef, {reactions: {...reactions, like: reactions.like+1, dislike: reactions.dislike-1, users: updatedUsers}}, { merge: true })
    }else if (checkIfUserLikedOrDisliked?.type === "like"){
      const updatedUsers = reactions.users.filter((user) => user.id !== AuthUser.id || user.type !== "like")
      setReactions({ ...reactions, like: reactions.like - 1, users: updatedUsers })
      setDoc(docRef, {reactions: {...reactions, like: reactions.like - 1, users: updatedUsers}}, { merge: true })
    }else{
      setDoc(docRef, {reactions: {...reactions, like: reactions.like + 1, users: arrayUnion({ id: AuthUser.id, type: "like" })}}, { merge: true })
      setReactions({...reactions, like: reactions.like + 1, users: [...reactions.users, { id: AuthUser.id, type: "like" }]})
    }
  }

  const dislike = () => {
    const checkIfUserLikedOrDisliked = reactions?.users?.find((user) => user.id === AuthUser.id)
    const docRef = doc(db, "products", id, "reviews", review)

    if (checkIfUserLikedOrDisliked?.type === "like") {
      const updatedUsers = reactions.users.map((user) => {
        if (user.id === AuthUser.id) {
          return {
            ...user,
            type: "dislike"
          }
        }
        return user
      })
      setReactions({ ...reactions, like: reactions.like - 1, dislike: reactions.dislike + 1, users: updatedUsers })
      setDoc(docRef, { reactions: { ...reactions, like: reactions.like - 1, dislike: reactions.dislike + 1, users: updatedUsers } }, { merge: true })
    }else if (checkIfUserLikedOrDisliked?.type === "dislike"){
      const updatedUsers = reactions.users.filter((user) => user.id !== AuthUser.id || user.type !== "dislike")
      setReactions({ ...reactions, dislike: reactions.dislike - 1, users: updatedUsers })
      setDoc(docRef, { reactions: { ...reactions, dislike: reactions.dislike - 1, users: updatedUsers } }, { merge: true })
    } else {
      setDoc(docRef, { reactions: { ...reactions, dislike: reactions.dislike + 1, users: arrayUnion({ id: AuthUser.id, type: "dislike" }) } }, { merge: true })
      setReactions({ ...reactions, dislike: reactions.dislike + 1,  users: [...reactions.users, { id: AuthUser.id, type: "dislike" }]})
    }
  }

  return (
    <MainLayout title={"Amazon Clone - Cart"} description={"Amazon Clone - Cart"}>
      <div className="flex flex-col ">
        <div className="max-w-screen-xl px-2 py-2">
          <h2 className="text-xl font-bold sm:text-2xl">
            Customer Review <button onClick={() => router.push(`/products/${id}`)} className="btn btn-xs btn-outline">Go back to product</button>
          </h2>
        </div>

        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="inline-block relative">
              <div className="relative w-16 h-16 rounded-full overflow-hidden">
                <Image className="absolute top-0 left-0 w-full h-full bg-cover object-fit object-cover" src={reviewInfo?.userDocData?.photoURL} alt="Profile picture" width={64} height={64} />
                <div className="absolute top-0 left-0 w-full h-full rounded-full shadow-inner"></div>
              </div>
              {reviewInfo?.verifiedBuyer && <svg className="fill-current text-white bg-green-600 rounded-full p-1 absolute bottom-0 right-0 w-6 h-6 -mx-1 -my-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M19 11a7.5 7.5 0 0 1-3.5 5.94L10 20l-5.5-3.06A7.5 7.5 0 0 1 1 11V3c3.38 0 6.5-1.12 9-3 2.5 1.89 5.62 3 9 3v8zm-9 1.08l2.92 2.04-1.03-3.41 2.84-2.15-3.56-.08L10 5.12 8.83 8.48l-3.56.08L8.1 10.7l-1.03 3.4L10 12.09z"/>
              </svg>}
            </div>
          </div>
          <div className="ml-6">
            <p className="flex items-baseline">
              <span className="text-gray-600 font-bold">{reviewInfo?.userDocData?.displayName}</span>
              {reviewInfo?.verifiedBuyer && <span className="ml-2 text-green-600 text-xs">Verified Buyer</span>}
            </p>
            <div className="flex items-center mt-1">
            {[...Array(5)].map((_, index) => {
              index += 1
              return (
                <svg key={index} aria-hidden="true" className={index <= (reviewInfo?.rating) ? "w-5 h-5 text-yellow-400 " : "w-5 h-5 text-gray-500"} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>First star</title><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              )
            })}
            </div>
            <div className="mt-3 relative break-words">
              <span className="font-bold">{reviewInfo?.headline}</span>
              <p className="mt-1 ">{reviewInfo?.review}</p>
            </div>
            <div className="mt-3">
              {reviewInfo?.images?.length > 0 && <div className="flex flex-wrap -mx-2">
                {reviewInfo?.images?.map((image, index) => (
                  <div key={index} className="px-2">
                    <Zoom>
                      <img src={image} alt="Review image" className='object-contain' width={150} height={150} />
                    </Zoom>
                  </div>
                ))}
              </div>}
              <p>Click on image to zoom in</p>
            </div>
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600 fill-current">
              <button className="flex items-center">
                <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.08 12.16A2.99 2.99 0 0 1 0 10a3 3 0 0 1 5.08-2.16l8.94-4.47a3 3 0 1 1 .9 1.79L5.98 9.63a3.03 3.03 0 0 1 0 .74l8.94 4.47A2.99 2.99 0 0 1 20 17a3 3 0 1 1-5.98-.37l-8.94-4.47z"/></svg>
                <span className="ml-2">Share</span>
              </button>
              <div className="flex items-center">
                <span>Was this review helplful?</span>
                <button onClick={like} className="flex items-center ml-6">
                  <svg className={`w-3 h-3 ${reactions?.users?.find((user) => user.id === AuthUser.id)?.type === "like" && "fill-green-700"}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M11 0h1v3l3 7v8a2 2 0 0 1-2 2H5c-1.1 0-2.31-.84-2.7-1.88L0 12v-2a2 2 0 0 1 2-2h7V2a2 2 0 0 1 2-2zm6 10h3v10h-3V10z"/></svg>
                  <span className="ml-2">{reactions.like}</span>
                </button>
                <button onClick={dislike} className="flex items-center ml-4">
                  <svg className={`w-3 h-3 ${reactions?.users?.find((user) => user.id === AuthUser.id)?.type === "dislike" && "fill-red-700"}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M11 20a2 2 0 0 1-2-2v-6H2a2 2 0 0 1-2-2V8l2.3-6.12A3.11 3.11 0 0 1 5 0h8a2 2 0 0 1 2 2v8l-3 7v3h-1zm6-10V0h3v10h-3z"/></svg>
                  <span className="ml-2">{reactions.dislike}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export const getServerSideProps = withAuthUserTokenSSR()()

export default ReviewInfo

