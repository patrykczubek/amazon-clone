import { useState, useCallback, useContext } from 'react'
import { Button } from 'flowbite-react'

import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'

import { db } from '@/utils/firebase'
import { doc, setDoc } from '@firebase/firestore'

import { itemListEditSchema } from '../schemas'

import { ListContext } from '../context/ListContext'

export const useExtraInfoModal = () => {
  const [ extraInfoModalState, setExtraInfoModalState ] = useState(false)
  const [ modalInfo, setModalInfo ] = useState({})

  const { addItemExtras } = useContext(ListContext)

  const { register, handleSubmit, reset } = useForm({
    resolver: yupResolver(itemListEditSchema)
  })

  const toggleExtraInfoModal = useCallback((data) => {
    if(data?.itemID){
      const { extras } = data
      reset({comment: extras?.comment || "", priority: extras?.priority || 0, itemsNeeded: extras?.itemsNeeded || 0, itemsHave: extras?.itemsHave || 0})
      setModalInfo(data)
    }
    setExtraInfoModalState(!extraInfoModalState), [extraInfoModalState]
  })

  const onSubmit = (data) => {
    const { listID, itemID } = modalInfo

    addItemExtras(listID, itemID, data)
    toggleExtraInfoModal()
    reset()
  }

  const ExtraInfoModal = useCallback(() => {
    return (extraInfoModalState && (
      <>
        <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
          <div className="relative w-auto my-6 mx-auto max-w-sm">
            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">

              <div className="flex items-start justify-between px-5 py-4 border-b border-solid border-slate-200 rounded-t bg-[#f0f2f2]">
                <h3 className="font-semibold text-black">
                  Add item comment, quantity, etc..
                </h3>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="relative p-2 flex-auto">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold text-black">Leave a comment</span>
                    </label>
                    <textarea {...register("comment")} className="textarea textarea-bordered h-24" placeholder="Comment...."></textarea>
                  </div>

                  <div className="form-control w-full max-w-xs">
                    <label className="label">
                      <span className="label-text font-semibold text-black">Item priority</span>
                    </label>
                    <select {...register("priority")} className="select select-bordered">
                      <option value={0}>Lowest</option>
                      <option value={1}>Low</option>
                      <option value={2}>Medium</option>
                      <option value={3}>High</option>
                      <option value={4}>Highest</option>
                    </select>
                  </div>

                  <div className="form-control w-full max-w-xs">
                    <label className="label">
                      <span className="label-text font-semibold text-black">Items needed:</span>
                    </label>
                    <input {...register("itemsNeeded")} type="text" placeholder="1" className="input input-bordered w-full max-w-xs" />
                  </div>

                  <div className="form-control w-full max-w-xs">
                    <label className="label">
                      <span className="label-text font-semibold text-black">Items has:</span>
                    </label>
                    <input {...register("itemsHave")} type="text" placeholder="0" className="input input-bordered w-full max-w-xs" />
                  </div>
                </div>

                <div className="flex items-center justify-end p-2 border-t border-solid border-slate-200 rounded-b">
                  <button type="button" onClick={toggleExtraInfoModal} className="bg-red-700 text-white text-sm px-1.5 py-1.5 rounded shadow hover:shadow-xl outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150">
                    Cancel
                  </button>
                  <button type="submit" className="bg-[#face0af3] text-black text-sm px-1.5 py-1.5 rounded shadow hover:shadow-xl outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
      </>)
    )
  }, [extraInfoModalState])

  return {
    toggleExtraInfoModal,
    ExtraInfoModal
  }
}