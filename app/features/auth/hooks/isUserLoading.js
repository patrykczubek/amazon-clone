import { useState, useEffect } from 'react'

export const isUserLoading = (user) => {
  const [ loading, isLoading ] = useState(true)
  const [ hasUser, setHasUser ] = useState(false)

  useEffect(() => {
    if(user?.clientInitialized){
      isLoading(false)
      if(user?.id) setHasUser(true)
    }
  }, [user])

  return {
    loading,
    hasUser
  }
}