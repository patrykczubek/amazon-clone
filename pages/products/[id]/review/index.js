import { useEffect, useState, useContext, useCallback } from 'react'
import { useDropzone } from "react-dropzone";

import { useAuthUser, withAuthUserTokenSSR } from 'next-firebase-auth'
import { useRouter } from 'next/router'

import Link from 'next/link'
import Image from 'next/image'

import { MainLayout } from '@/components/Layout'

import { isUserLoading } from '@/features/auth/hooks/isUserLoading'

import { arrayUnion, collection, doc, getDoc, setDoc, addDoc, updateDoc, Timestamp } from '@firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/utils/firebase'

import { ProductsContext } from '@/features/products'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'

const Review = () => {
  const router = useRouter()
  const AuthUser = useAuthUser()

  const { id } = router.query || null

  const { loading, hasUser } = isUserLoading(AuthUser)

  const [ productData, setProductData ] = useState({})

  const [ itemPreviouslyBought, setItemPreviouslyBought ] = useState({ previouslyBought: false, lastPurchased: null})

  const { checkItem, previouslyBought } = useContext(ProductsContext)

  useEffect(() => {
    if(loading || !id) return

    const func = async () => {
      const docRef = doc(db, "products", id)
      const docSnap = await getDoc(docRef)
      const docData = docSnap.data()

      checkItem()

      setProductData(docData)
    }
    func()
  }, [id, hasUser, loading])

  useEffect(() => {
    if(previouslyBought.length === 0) return

    const { time, orderID } = previouslyBought?.find(({items}) => items.includes(id)) || {}
    if(time) setItemPreviouslyBought({ previouslyBought: true, lastPurchased: time, orderID: orderID})
  }, [previouslyBought])

  const addIdeaSchema = Yup.object().shape({
    rating: Yup.number(),
    review: Yup.string().required("Review is required"),
    headline: Yup.string().required("Headline is required"),
  })

  const { register, unregister, handleSubmit, setValue, watch, reset } = useForm({
    resolver: yupResolver(addIdeaSchema)
  })

  useEffect(() => {
    register("pictures")
  }, [register, unregister])

  const watchRating = watch("rating")
  const files = watch("pictures")

  const [ progress, setProgress ] = useState([])
  const [ submittingForm, setSubmittingForm ] = useState(false)

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index)
    setValue("pictures", newFiles, { shouldValidate: true })
  }

  const onDrop = useCallback((droppedFiles) => {
    let newFiles = [...(files || []), ...droppedFiles]
    newFiles = newFiles.reduce((prev, file) => {
      const fo = Object.entries(file);
      if(prev.find((e) => {
        const eo = Object.entries(e);
        return eo.every(([key, value], index) =>
          key === fo[index][0] && value === fo[index][1]
        )
        })){
          return prev
        }else{
          return [...prev, file]
        }
      }, [])
      setValue("pictures", newFiles, { shouldValidate: true })
    },
    [setValue, files]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {'image/jpeg': ['.jpeg', '.png'], 'image/png': ['.png', '.jpeg']}
  })

  const onSubmit = async ({ headline, rating, review, pictures: multipleImages }) => {
    setSubmittingForm(true)
    setProgress(multipleImages.map(() => 0))
    await new Promise(res => setTimeout(res, 3000))

    const docRef = collection(db, "products", id, "reviews")
    const addReviewDoc = await addDoc(docRef, {
      headline,
      rating,
      review,
      images: [],
      timeAdded: Timestamp.now(),
      verifiedBuyer: itemPreviouslyBought.previouslyBought,
      id: AuthUser.id
    })

    const newDocRef = doc(db, "products", id, "reviews", addReviewDoc.id)

    for (let i = 0; i < multipleImages.length; i++) {
      const image = multipleImages[i]

      const storageRef = ref(storage, `images/product/reviews/${addReviewDoc.id}/${image.name}`)
      const uploadTask = uploadBytesResumable(storageRef, image)
      uploadTask.on('state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100

        setProgress((prevProgress) => {
          const newProgress = [...prevProgress]
          newProgress[i] = progress.toFixed(2)
          return newProgress
        })
      }, (error) => {
        console.log(error)
      }, async () => {
        const imageUrl = await getDownloadURL(uploadTask.snapshot.ref)
        updateDoc(newDocRef, { images: arrayUnion(imageUrl) }, { merge: true })
})
    }
    reset()
  }

  return (
    <MainLayout title={"Amazon Clone - Cart"} description={"Amazon Clone - Cart"}>
      <div className="flex flex-col ">
        {submittingForm &&
        <div className="flex flex-col items-center justify-center h-screen">
          {progress?.every(p => p !== '100.00') && <>
            Uploading your from...<br/>
            Pictures upload progress: {progress?.map((p) => <div class="radial-progress" style={{ "--value": p}}>{p}%</div>)}
          </>}
          {progress?.every(p => p === '100.00') && <div className="flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold">Thank you for your review!</h1>
            <button onClick={() => router.push(`/products/${id}`)} className="btn btn-primary">Go back to product</button>
            </div>}
        </div>
        }
        {!submittingForm && <div className="flex flex-col">
          <div className="flex flex-col mt-4">
            <form onSubmit={handleSubmit(onSubmit)}>
              {itemPreviouslyBought?.previouslyBought &&
              <div className="flex flex-col">
                <h1 className="text-xl font-bold">Add a Review</h1>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-black">Add a headline</span>
                  </label>
                  <input {...register("headline")} className="textarea textarea-bordered" placeholder="Whats most important to know?"></input>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-black">Overall Rating</span>
                  </label>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, index) => {
                      index += 1
                      return (
                        <button type="button" key={index} onClick={() => setValue('rating', index)} onDoubleClick={() => { setValue('rating', 0) }} >
                          <svg aria-hidden="true" className={index <= (watchRating) ? "w-10 h-10 text-yellow-400 " : "w-10 h-10 text-gray-500"} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>First star</title><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-black">Add a photo or video</span>
                  </label>

                  <div {...getRootProps()}>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" {...getInputProps()} />

                    <div className={"w-full p-2 border border-dashed border-gray-900 " + (isDragActive ? "bg-gray-400" : "bg-gray-200") }>
                      <p className="text-center my-2">Drop the files here ...</p>
                    </div>
                  </div>

                  {!!files?.length && (
                    <div className="flex flex-wrap mt-4">
                      {files.map((file, i) => {
                        return (
                          <div key={file.name} className="flex flex-col items-center justify-center w-32 h-32 m-2 bg-gray-100 rounded-md">
                            <img src={URL.createObjectURL(file)} alt={file.name} className="w-32 h-32 object-cover rounded-md"  />
                            <button type="button" onClick={() => removeFile(i)} className="flex items-center justify-center w-6 h-6 mt-2 bg-red-500 rounded-full">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>                   
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
              </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-black">Add a written review</span>
                  </label>
                  <span className="label-text-alt text-gray-500">Shoppers find images and videos more helpful than text alone.</span>

                  <textarea {...register("review")} className="textarea textarea-bordered h-24" placeholder="What did you like or dislike? What did you use this product for?"></textarea>
                </div>
              </div>}

              <div className="flex flex-col mt-4">
                <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                  Add Review
                </button>
              </div>
            </form>
          </div>
        </div>}
      </div>
    </MainLayout>
  )
}

export const getServerSideProps = withAuthUserTokenSSR()()

export default Review

