import { useState, useEffect } from 'react'

export const isMounted = () => {

  const [ mounted, setMounted ] = useState(false)

  useEffect(() => {
    if(mounted) return
    setMounted(true)
  }, [])

  return {
    mounted
  }
}