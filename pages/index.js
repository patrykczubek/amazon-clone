import { useRouter } from 'next/router'

import { useAuthUser, withAuthUserTokenSSR } from 'next-firebase-auth'

import { MainLayout } from '@/components/Layout'

const Home = () => {
  const AuthUser = useAuthUser()
  const router = useRouter()

  return (
    <MainLayout title={"Amazon Clone - Cart"} description={"Amazon Clone - Cart"}>
      <h1>Main Page</h1><br/>

      <h1>Logged in: {AuthUser.id ? "True" : "False"}</h1><br/>

      <h1><button onClick={() => AuthUser.signOut()}>Sign out</button></h1>
      <h1><button onClick={() => router.push("/auth/login")}>Sign in</button></h1>
    </MainLayout>
  )
}

export const getServerSideProps = withAuthUserTokenSSR()()

export default Home
