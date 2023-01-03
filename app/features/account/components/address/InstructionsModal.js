import { useState, useCallback } from 'react'
import { Button } from 'flowbite-react'

import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'

import { db } from '@/utils/firebase'
import { doc, setDoc } from '@firebase/firestore'

import HouseIcon from '@mui/icons-material/House'
import ApartmentIcon from '@mui/icons-material/Apartment'
import BusinessIcon from '@mui/icons-material/Business'
import OtherHousesIcon from '@mui/icons-material/OtherHouses'

import { deliveryInstructionsSchema } from '@/features/account/schemas/address'

export const useDeliveryInstructionsModal = () => {
  const [ deliveryInstructionsModalState, setDeliveryInstructionsModalState ] = useState(false)
  const [ selectedPropertyType, setSelectedPropertyType ] = useState(0)
  const [ editingPropertyType, setEditingPropertyType ] = useState(false)

  const [ modalInfo, setModalInfo ] = useState({})

  const { register, handleSubmit, reset } = useForm({
    resolver: yupResolver(deliveryInstructionsSchema)
  })

  const toggleDeliveryInstructionsModal = useCallback((data) => {
    if(data?.docID){
      setModalInfo(data)
      setSelectedPropertyType(data?.additionalInstructions?.propertyType || 0)
      setEditingPropertyType(false)
      data?.additionalInstructions && reset(data.additionalInstructions)
    }
    setDeliveryInstructionsModalState(!deliveryInstructionsModalState), [deliveryInstructionsModalState]
  })

  const onSubmit = (data) => {
    setDoc(doc(db, "userShipmentAddresses", modalInfo.docID), {
      additionalInstructions: {
        propertyType: selectedPropertyType,
        location: data.location,
        instructions: data.instructions,
        securitycode: data.securitycode
      }
    }, { merge: true })
    reset()
    setDeliveryInstructionsModalState(false)
  }

  const DeliveryInstructionsModal = useCallback(() => {
    return (deliveryInstructionsModalState && (
      <>
        <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
          <div className="relative w-auto my-6 mx-auto max-w-sm">
            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">

              <div className="flex items-start justify-between px-5 py-4 border-b border-solid border-slate-200 rounded-t bg-[#f0f2f2]">
                <h3 className="font-semibold text-black">
                  Add delivery instructions
                </h3>
              </div>

              <div className="relative p-2 flex-auto">
                <span className='text-black flex flex-col'>
                  <span className='font-semibold'>
                    {modalInfo?.name}
                  </span>
                  <span className='text-[#565959] font-semibold text-sm'>
                    {modalInfo?.billingAddress?.line1}, {modalInfo?.billingAddress?.city}, {modalInfo?.billingAddress?.state}, {modalInfo?.billingAddress?.zip}, {modalInfo?.billingAddress?.country}
                  </span>
                </span>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="relative p-2 flex-auto">
                  <span className='text-black flex flex-col'>
                    <span>
                      Property type: <span className='font-semibold'>{selectedPropertyType === 0 ? 'House' : selectedPropertyType === 1 ? 'Apartment' : selectedPropertyType === 2 ? 'Business' : selectedPropertyType === 3 ? 'Other' : 'Select property type'}</span> {!editingPropertyType && <button onClick={() => console.log("S") && setEditingPropertyType(true)} className='text-blue-400 underline hover:text-blue-600 text-sm'>Change</button>}
                    </span>

                    {editingPropertyType && <Button.Group>
                      <Button color={selectedPropertyType === 0 ? "success" : "gray"} onClick={() => setSelectedPropertyType(0)}>
                        <HouseIcon className="mr-3 h-4 w-4"/> House
                      </Button>
                      <Button color={selectedPropertyType === 1 ? "success" : "gray"} onClick={() => setSelectedPropertyType(1)}>
                        <ApartmentIcon className="mr-3 h-4 w-4"/> Apartment
                      </Button>
                      <Button color={selectedPropertyType === 2 ? "success" : "gray"} onClick={() => setSelectedPropertyType(2)}>
                        <BusinessIcon className="mr-3 h-4 w-4" /> Business
                      </Button>
                      <Button color={selectedPropertyType === 3 ? "success" : "gray"} onClick={() => setSelectedPropertyType(3)}>
                        <OtherHousesIcon className="mr-3 h-4 w-4" /> Other
                      </Button>
                    </Button.Group>}

                    <div className='mt-2'>
                        <div className='flex flex-col'>
                          <p className='mb-6'>
                            {selectedPropertyType === 0 && 'Single-family home or townhouse'}
                            {selectedPropertyType === 1 && 'Apartment or condo'}
                            {selectedPropertyType === 2 && 'Business, office, retail store, hotel, or other commercial property'}
                            {selectedPropertyType === 3 && 'Other'}
                          </p>
                        </div>
                      </div>

                    <div className='mt-2'>
                      <div className='flex flex-col'>
                        <span className='text-[#565959] font-semibold text-sm'>
                          Where should we leave your package at this address?
                        </span>
                        <input type="text" {...register('location')} className='border border-solid border-gray-300 rounded mt-1 p-2 w-full' placeholder='E.g. Front door, back door, garage, etc.'/>
                        <span className='text-[#565959] font-semibold text-sm mt-2'>
                          Do you have any special instructions for the delivery driver?
                        </span>
                        <input type="text" {...register('instructions')} className='border border-solid border-gray-300 rounded mt-1 p-2 w-full' placeholder='E.g. Ring the doorbell twice, knock three times, etc.'/>
                        <span className='text-[#565959] font-semibold text-sm mt-2'>
                          Do we need a security code to access your property?
                        </span>
                        <input type="text" {...register('securitycode')} className='border border-solid border-gray-300 rounded mt-1 p-2 w-full' placeholder='E.g. 1234'/>
                      </div>
                    </div>
                  </span>
                </div>

                <div className="flex items-center justify-end p-2 border-t border-solid border-slate-200 rounded-b">
                  <button type="button" onClick={toggleDeliveryInstructionsModal} className="bg-red-700 text-white text-sm px-1.5 py-1.5 rounded shadow hover:shadow-xl outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150">
                    Cancel
                  </button>
                  <button type="submit" className="bg-[#face0af3] text-black text-sm px-1.5 py-1.5 rounded shadow hover:shadow-xl outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150">
                    Save instructions
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
      </>)
    )
  }, [deliveryInstructionsModalState, editingPropertyType, selectedPropertyType])

  return {
    toggleDeliveryInstructionsModal,
    DeliveryInstructionsModal
  }
}