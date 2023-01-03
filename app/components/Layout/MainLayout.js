import { PageHead } from '@/components/Head'

import { Header } from '@/components/Header'
import { Footer } from '../Footer'

export const MainLayout = ({ title, description, children }) => {
  return (
    <>
      <PageHead title={title} description={description}/>

      <div className="h-screen flex overflow-hidden text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900">
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          <Header/>

          <main className="flex-1 relative overflow-y-auto focus:outline-none h-screen">
            {children}
          </main>

          <Footer/>
        </div>
      </div>
    </>
  )
}