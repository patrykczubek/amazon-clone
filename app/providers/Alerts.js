import { createContext } from 'react'

export const AlertsContext = createContext()
export const AlertsProvider = ({ children }) => {

  return (
    <AlertsContext.Provider value={{  }}>
      {children}
    </AlertsContext.Provider>
  )
}