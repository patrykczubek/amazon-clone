import { AuthAction, useAuthUser, withAuthUserTokenSSR } from 'next-firebase-auth'

import { useRouter } from 'next/router'

import { MainLayout } from '@/components/Layout'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

import { ListContext } from '@/features/lists'

import { listCreateSchema } from '@/features/lists'
import { useContext } from 'react'

const Account = () => {
  const router = useRouter()
  const AuthUser = useAuthUser()

  const { createList, lists } = useContext(ListContext)

  const { register, handleSubmit, formState } = useForm({ resolver: yupResolver(listCreateSchema) })
  const { errors } = formState

  const onSubmit = async ({name}) => {
    await createList(name)
  }

  return (
    <MainLayout title={"Amazon Clone - Lists"} description={"Amazon Clone - Lists"}>
      <div className="h-screen">
        <h1>Lists</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="relative p-2 flex-auto">
            <div className="flex items-end py-2">
              <div className="relative w-full mr-3">
                <label className="form-label inline-block px-1 pb-2 text-gray-700 font-bold">List name</label>
                <input name="name" {...register('name')} className="border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full  p-2.5 text-black" placeholder='Shopping List 1'/>
                {errors.name?.message && <span className='text-red-500 text-sm font-semibold'>{errors.name.message}</span>}
              </div>
            </div>

            <p className="text-slate-500 text-sm leading-relaxed">Use lists to save items for later. All lists are private unless you share them with others.</p>
          </div>
          <div className="flex items-center justify-end p-2 border-t border-solid border-slate-200 rounded-b">
            <button className="bg-slate-100 text-black text-sm px-1.5 py-1.5 rounded shadow hover:shadow-xl outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button" onClick={() => setCreateListModal(false)}>
              Cancel
            </button>
            <button className="bg-[#face0af3] text-black text-sm px-1.5 py-1.5 rounded shadow hover:shadow-xl outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="submit">
              Create List
            </button>
          </div>
        </form>

        <pre>
          {lists.map((list, i) => {
            return (
              <div key={i}>
                {list.docID} - {list.listName} - <button onClick={() => router.push(`/dashboard/lists/edit/${list.docID}`)} className="btn btn-sm">Go to list</button>
              </div>
            )
          })}
        </pre>
      </div>
    </MainLayout>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})()

export default Account
