import { AuthAction, useAuthUser, withAuthUserTokenSSR } from 'next-firebase-auth'

import { MainLayout } from '@/components/Layout'

import { Tab } from '@headlessui/react'

import { Address, Password } from '@/features/account'
import { useRouter } from 'next/router'

const Account = () => {
  const router = useRouter()
  const AuthUser = useAuthUser()

  return (
    <MainLayout title={"Amazon Clone - Account"} description={"Amazon Clone - Account"}>
      <div className="h-screen bg-gray-400">
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
            <Tab className={({ selected }) => `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`}>
              Account Info
            </Tab>
            <Tab className={({ selected }) => `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`}>
              Prime Subscription
            </Tab>
            <Tab className={({ selected }) => `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`}>
              Change Password
            </Tab>
            <Tab className={({ selected }) => `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`}>
              Order history
            </Tab>
            <Tab className={({ selected }) => `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`}>
              Lists
            </Tab>
            <Tab className={({ selected }) => `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`}>
              Manage addresses
            </Tab>
            <Tab className={({ selected }) => `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${selected ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'}`}>
              Payment methods
            </Tab>
          </Tab.List>
          <Tab.Panels className="mt-2">
            <Tab.Panel className='bg-white p-3 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'>
              <div>0</div>
            </Tab.Panel>
            <Tab.Panel className='bg-white p-3 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'>
              <div>1</div>
            </Tab.Panel>
            <Tab.Panel className='bg-white p-3 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'>
              <Password/>
            </Tab.Panel>
            <Tab.Panel className='bg-white p-3 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'>
              <div>3</div>
            </Tab.Panel>
            <Tab.Panel className='bg-white p-3 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'>
              <div>
                <button onClick={() => router.push("/dashboard/lists")}>Go to lists</button>
              </div>
            </Tab.Panel>
            <Tab.Panel className='bg-white p-3 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 '>
              <Address/>
            </Tab.Panel>
            <Tab.Panel className='bg-white p-3 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'>
              <div>6</div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </MainLayout>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})()

export default Account
