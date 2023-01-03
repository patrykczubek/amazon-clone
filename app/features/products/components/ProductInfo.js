import { useAuthUser } from 'next-firebase-auth'

import { useRouter } from 'next/router'

import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'

export const ProductInfo = ({ productData }) => {
  const AuthUser = useAuthUser()
  const router = useRouter()

  const { id } = router.query || null

  // add to cart, list, notify, etc

  return (
    <section>
      <div className="relative mx-auto max-w-screen-xl px-4 py-8">
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">{productData?.name}</h1>
          <h5>{productData?.brand} - {productData?.category}</h5>
          <p className="mt-1 text-sm text-gray-500">#{id}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-4 lg:items-start">
          <div className="lg:col-span-3">
            <div className="relative mt-4">
              <Zoom>
                <img alt="Tee" src={productData?.thumbnail} className="h-72 w-full rounded-xl object-contain lg:h-[540px]" />
              </Zoom>
              <p className="text-center">Click on image to zoom in</p>
            </div>

            <ul className="mt-1 flex gap-1">
              <li>
                <img alt="Tee" src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80" className="h-16 w-16 rounded-md object-cover" />
              </li>

              <li>
                <img alt="Tee" src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80" className="h-16 w-16 rounded-md object-cover" />
              </li>

              <li>
                <img alt="Tee" src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80" className="h-16 w-16 rounded-md object-cover" />
              </li>

              <li>
                <img alt="Tee" src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80" className="h-16 w-16 rounded-md object-cover" />
              </li>
            </ul>
          </div>

          <div className="lg:sticky lg:top-0">
            <form className="space-y-4 lg:pt-8">
              <fieldset>
                <legend className="text-lg font-bold">Color</legend>

                <div className="mt-2 flex gap-1">
                  <label htmlFor="color_green" className="cursor-pointer">
                    <input type="radio" id="color_green" name="color" className="peer sr-only" checked/>
                    <span className="block h-6 w-6 rounded-full border border-gray-200 bg-green-700 ring-1 ring-transparent ring-offset-1 peer-checked:ring-gray-300"></span>
                  </label>

                  <label htmlFor="color_blue" className="cursor-pointer">
                    <input type="radio" id="color_blue" name="color" className="peer sr-only"/>
                    <span className="block h-6 w-6 rounded-full border border-gray-200 bg-blue-700 ring-1 ring-transparent ring-offset-1 peer-checked:ring-gray-300"></span>
                  </label>

                  <label htmlFor="color_pink" className="cursor-pointer">
                    <input type="radio" id="color_pink" name="color" className="peer sr-only"/>

                    <span className="block h-6 w-6 rounded-full border border-gray-200 bg-pink-700 ring-1 ring-transparent ring-offset-1 peer-checked:ring-gray-300"></span>
                  </label>

                  <label htmlFor="color_red" className="cursor-pointer">
                    <input type="radio" id="color_red" name="color" className="peer sr-only"/>
                    <span className="block h-6 w-6 rounded-full border border-gray-200 bg-red-700 ring-1 ring-transparent ring-offset-1 peer-checked:ring-gray-300"></span>
                  </label>

                  <label htmlFor="color_indigo" className="cursor-pointer">
                    <input type="radio" id="color_indigo" name="color" className="peer sr-only"/>
                    <span className="block h-6 w-6 rounded-full border border-gray-200 bg-indigo-700 ring-1 ring-transparent ring-offset-1 peer-checked:ring-gray-300"></span>
                  </label>
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-lg font-bold">Material</legend>

                <div className="mt-2 flex gap-1">
                  <label htmlFor="material_cotton" className="cursor-pointer">
                    <input type="radio" id="material_cotton" name="material" className="peer sr-only" checked/>
                    <span className="block rounded-full border border-gray-200 px-3 py-1 text-xs peer-checked:bg-gray-100">
                      Cotton
                    </span>
                  </label>

                  <label htmlFor="material_wool" className="cursor-pointer">
                    <input type="radio" id="material_wool" name="material" className="peer sr-only" checked/>
                    <span className="block rounded-full border border-gray-200 px-3 py-1 text-xs peer-checked:bg-gray-100">
                      Wool
                    </span>
                  </label>
                </div>
              </fieldset>

              <div>
                <p className="text-xl font-bold">${productData.price}</p>
              </div>

              <button type="submit" className="w-full rounded bg-red-700 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white">
                Add to cart
              </button>

              <button type="button" className="w-full rounded border border-gray-300 bg-gray-100 px-6 py-3 text-sm font-bold uppercase tracking-wide">
                Notify when on sale
              </button>
            </form>
          </div>

          <div className="lg:col-span-3">
            <div className="prose max-w-none [&>iframe]:mt-6 [&>iframe]:aspect-video [&>iframe]:w-full [&>iframe]:rounded-xl">
              <p>
                {productData.description}
              </p>

              <h2>Features</h2>

              <ul>
                <li>Smooth neck design</li>
                <li>Breathable fabric</li>
                <li>Odour prevention</li>
                <li>Made from recycled materials</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}