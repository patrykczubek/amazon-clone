import { useState, useCallback } from 'react'

export const useLocationModal = () => {
  const [ locationModalState, setLocationModalState ] = useState(false)

  const toggleLocationModal = useCallback(() => setLocationModalState(!locationModalState), [locationModalState])

  const LocationModal = useCallback(() => {
    return (locationModalState && (
      <>
        <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
          <div className="relative w-auto my-6 mx-auto max-w-sm">
            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">

              <div className="flex items-start justify-between px-5 py-4 border-b border-solid border-slate-200 rounded-t bg-[#f0f2f2]">
                <h3 className="font-semibold text-black">
                  Choose your location
                </h3>
              </div>

              <div className="relative p-2 flex-auto">
                <p className=" text-slate-500 text-sm leading-relaxed">
                  Delivery options and delivery speeds may vary for different locations.
                </p>
                <span className='text-black flex flex-col'>
                  <span className='font-semibold'>
                    Patryk Czubek - Detroit - 48212
                  </span>
                  <span className='text-[#565959] font-semibold text-sm'>
                    Default Address
                  </span>
                </span>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-b border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-sm text-gray-500">or enter a US zip code</span>
                  </div>
                </div>

                <div className="flex items-end py-2">
                  <div className="relative w-full mr-3">
                    <input className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full  p-2.5 text-black"/>
                  </div>
                  <div>
                    <input type="submit" value="Apply" className="cursor-pointer text-black font-medium rounded-lg text-sm px-5 py-2.5 text-center border border-gray-300" name="member" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end p-2 border-t border-solid border-slate-200 rounded-b">
                <button type="button" onClick={toggleLocationModal} className="bg-[#face0af3] text-black text-sm px-1.5 py-1.5 rounded shadow hover:shadow-xl outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150">
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
      </>)
    )
  }, [locationModalState])

  return {
    toggleLocationModal,
    LocationModal
  }
}