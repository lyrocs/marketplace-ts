'use client'

import { ApolloProvider } from '@apollo/client/react'
import { apolloClient } from '@/graphql/client'
import { AuthProvider } from '@/hooks/use-auth'
import { ToastProvider } from '@nextrade/ui'
import { Toaster } from './toaster'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <ToastProvider>
          {children}
          <Toaster />
        </ToastProvider>
      </AuthProvider>
    </ApolloProvider>
  )
}
