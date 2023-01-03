import { init } from 'next-firebase-auth'
import absoluteUrl from 'next-absolute-url'

const TWELVE_DAYS_IN_MS = 12 * 60 * 60 * 24 * 1000

const initAuth = () => {
  init({
    debug: false,
    authPageURL: ({ ctx }) => {
      const isServerSide = typeof window === 'undefined'
      const origin = isServerSide ? absoluteUrl(ctx.req).origin : window.location.origin
      const destPath = typeof window === 'undefined' ? ctx.resolvedUrl : window.location.href
      const destURL = new URL(destPath, origin)
      return `auth/login?destination=${encodeURIComponent(destURL)}`
    },
    appPageURL: ({ ctx }) => {
      const isServerSide = typeof window === 'undefined'
      const origin = isServerSide ? absoluteUrl(ctx.req).origin : window.location.origin
      const params = isServerSide ? new URL(ctx.req.url, origin).searchParams : new URLSearchParams(window.location.search)
      const destinationParamVal = params.get('destination') ? decodeURIComponent(params.get('destination')) : undefined

      let destURL = '/'
      if (destinationParamVal) {
        const allowedHosts = ['localhost:3000', 'amazon-clone-khaki-ten.vercel.app']
        const allowed = allowedHosts.indexOf(new URL(destinationParamVal).host) > -1
        if (allowed) {
          destURL = destinationParamVal
        } else {
          console.warn(`Redirect destination host must be one of ${allowedHosts.join(', ')}.`)
        }
      }
      return destURL
    },
    loginAPIEndpoint: '/api/auth/login',
    logoutAPIEndpoint: '/api/auth/logout',
    firebaseAdminInitConfig: {
      credential: {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY ? JSON.parse(process.env.FIREBASE_PRIVATE_KEY) : undefined
      },
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
    },
    firebaseClientInitConfig: {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_PUBLIC_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    },
    cookies: {
      name: 'amazon-clone',
      keys: [
        process.env.COOKIE_SECRET_CURRENT,
        process.env.COOKIE_SECRET_PREVIOUS
      ],
      httpOnly: true,
      maxAge: TWELVE_DAYS_IN_MS,
      overwrite: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NEXT_PUBLIC_COOKIE_SECURE === 'true',
      signed: true
    }
  })
}

export default initAuth
