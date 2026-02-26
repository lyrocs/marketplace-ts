import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client'
import { onError } from '@apollo/client/link/error'
import { CombinedGraphQLErrors } from '@apollo/client/errors'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('marketplace_token')
}

const httpLink = new HttpLink({
  uri: `${API_URL}/graphql`,
  fetchOptions: {
    credentials: 'include',
  },
  headers: {},
  fetch: (input, init) => {
    const token = getToken()
    if (token && init?.headers) {
      ;(init.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
    }
    return fetch(input, init)
  },
})

const errorLink = onError(({ error }) => {
  if (CombinedGraphQLErrors.is(error)) {
    error.errors.forEach(({ message }) => {
      console.error('GraphQL Error:', message)
    })
  } else {
    console.error('Network Error:', error)
  }
})

export const apolloClient = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          deals: {
            merge(existing, incoming) {
              return incoming
            },
          },
          products: {
            merge(existing, incoming) {
              return incoming
            },
          },
        },
      },
    },
  }),
})
