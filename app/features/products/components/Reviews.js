import { useEffect, useState } from 'react'
import { useAuthUser } from 'next-firebase-auth'

import { useRouter } from 'next/router'
import Link from 'next/link'

import { collection, doc, getDoc, getDocs } from '@firebase/firestore'
import { db } from '@/utils/firebase'

import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'

export const Reviews = () => {
  const AuthUser = useAuthUser()
  const router = useRouter()

  const { id } = router.query || null

  const [ reviews, setReviews ] = useState([])
  const [ reviewsCount, setReviewsCount ] = useState(0)
  const [ reviewAvg, setReviewAvg ] = useState(0)
  const [ loading, setLoading ] = useState(true)

  useEffect(() => {
    const func = async () => {
      const docRef = doc(db, "products", id)
      const reviewsRef = collection(docRef, 'reviews')
      const docs = await getDocs(reviewsRef)

      if(docs.docs.length === 0){
        setLoading(false)
        return
      }

      const allDocs = docs.docs.map(doc => {
        return {
          docID: doc.id,
          ...doc.data()
        }
      })

      const allDocsInfos = await Promise.all(allDocs.map(async (docData) => {
        const userDocRef = doc(db, "users", docData.id)
        const userDocSnap = await getDoc(userDocRef)
        const userDisplayName = userDocSnap.data().displayName
        return {
          ...docData,
          displayName: userDisplayName
        }
      }))

      setReviews(allDocsInfos)
      setReviewsCount(docs.docs.length)
      setReviewAvg(docs.docs.reduce((acc, doc) => acc + doc.data().rating, 0) / docs.docs.length)
      setLoading(false)
    }
    func()
  }, [])

  return (
    <section>
      {loading && <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold sm:text-2xl">
          Reviews loading...
        </h2>
      </div>}

      {!loading && <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold sm:text-2xl">
          Customer Reviews{' '} {AuthUser?.id && !reviews.find(v => v.id === AuthUser?.id) && <button onClick={() => router.push(`/products/${id}/review`)} className="btn btn-xs btn-outline">Leave a review</button>}
        </h2>

        <div className="mt-4 flex items-center">
          <p className="text-3xl font-medium">
            {reviewAvg.toFixed(1)} <span className="sr-only"> Average review score </span>
          </p>

          <div className="ml-4">
            <div className="-ml-1 flex">
              {[...Array(5)].map((_, index) => {
                index += 1
                return (
                  <svg key={index} aria-hidden="true" className={index <= (reviewAvg.toFixed(1)) ? "w-5 h-5 text-yellow-400 " : "w-5 h-5 text-gray-500"} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>First star</title><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                )
              })}
            </div>
            <p className="mt-0.5 text-xs text-gray-500">Based on {reviewsCount} reviews</p>
          </div>
        </div>

        {reviews.length === 0 && <div className="mt-8"><p className="text-gray-500">No reviews yet.</p></div>}

        {reviews.length > 0 && <div className="mt-8 grid grid-cols-1 gap-x-16 gap-y-12 lg:grid-cols-2">
          {reviews.map((review, i) => (
          <blockquote key={i} className=''>
            <header className="sm:flex sm:items-center">
              <div className="-ml-1 flex">
                {[...Array(5)].map((_, index) => {
                  index += 1
                  return (
                    <svg key={index} aria-hidden="true" className={index <= (review.rating) ? "w-5 h-5 text-yellow-400 " : "w-5 h-5 text-gray-500"} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>First star</title><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  )
                })}
              </div>

              <p className="mt-2 font-medium sm:ml-4 sm:mt-0">
                <Link href={router.asPath + "/review/" + review.docID}>
                  <a href={router.asPath + "/review/" + review.docID} className="text-gray-900 hover:underline">{review.headline}</a>
                </Link>
              </p>
            </header>

            <p className="mt-2 text-gray-700 relative break-words">{review.review}</p>

            <div className='flex overflow-x-auto'>
              {review.images && review.images.map((image, i) => (
                <Zoom key={i}>
                  <img key={i} src={image} alt="" className={`w-24 h-24 object-cover rounded-lg mt-4 ${i > 0 && "ml-1"}`} />
                </Zoom>
              ))}
            </div>

            <footer className="mt-4">
              <p className="text-xs text-gray-500">{review.displayName} - {review.timeAdded.toDate().toDateString()} {review.timeAdded.toDate().toLocaleTimeString()}</p>
              {review.verifiedBuyer && <div className="badge badge-success">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-check"><polyline points="20 6 9 17 4 12"></polyline></svg>Verified Buyer
              </div>}
            </footer>
          </blockquote>
          ))}
        </div>}
      </div>}
    </section>
  )
}