import { createContext, useState, useEffect } from 'react'

export const ErrorContext = createContext()
export const ErrorProvider = ({ children }) => {


  return (
    <ErrorContext.Provider value={{

    }}>
      {children}
    </ErrorContext.Provider>
  )
}