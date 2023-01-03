import '@/styles/globals.css'
import initAuth from '@/utils/initAuth'
import { MainProviders } from '@/providers/MainProviders'
import { Analytics } from '@vercel/analytics/react'

initAuth()

import { withAuthUser } from 'next-firebase-auth'

const MyApp = ({ Component, pageProps }) => {
  return (
    <MainProviders>
      <Component {...pageProps}/>
      <Analytics />
    </MainProviders>
  )
}

export default withAuthUser({
  LoaderComponent: () => <div>Loading...</div>
})(MyApp)