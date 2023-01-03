import { ThemeProvider } from 'next-themes'

import { AlertsContext } from './Alerts'
// import { ErrorContext } from './Errors'

import { ProductsProvider } from '@/features/products'

import { CartPrivder } from '@/features/carts'
import { ListProvider } from '@/features/lists'

import { combineComponents } from '@/utils/combineComponents'

const providers = [
  ThemeProvider,
  // AlertsContext,
  // ErrorContext,
  CartPrivder,
  ListProvider,
  ProductsProvider
]

const CombinedProviders = combineComponents(...providers)

export const MainProviders = ({ children }) => {
  return (
    <CombinedProviders>
      {children}
    </CombinedProviders>
  )
}