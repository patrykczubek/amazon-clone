import { MainLayout } from "../Layout"

import { useAuthUser } from 'next-firebase-auth'

export const Custom404 = () => {
  const AuthUser = useAuthUser()

  return (
    <MainLayout title={"Amazon Clone - Oops"}>
      <div className="flex items-center justify-center h-screen mx-2 my-2 overflow-hidden ">
        <div className="px-6 py-4 rounded shadow-lg">
          <div className="mb-2 text-xl font-bold text-slate-600">
            404 - Sorry could not find this page 😅
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

