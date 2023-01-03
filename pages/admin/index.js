import { withAuthUser, AuthAction, withAuthUserTokenSSR, getUserFromCookies } from 'next-firebase-auth'
// import admin from 'firebase-admin'

const Admin = () => {
  return (
    <div>
      Admin
    </div>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ req }) => {
  let user
  try {
    user = await getUserFromCookies({ req })
  } catch (e) {
    console.error(e)
    return res.status(403).json({ error: 'Not authorized' })
  }

  const isAdmin = user.claims?.admin

  if (!isAdmin) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }

  // await admin.auth().setCustomUserClaims(user.id, { admin: true })

  return {
    props: {}
  }
})

export default withAuthUser()(Admin)