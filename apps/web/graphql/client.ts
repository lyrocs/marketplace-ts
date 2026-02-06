import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client'
import { onError } from '@apollo/client/link/error'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('nextrade_token')
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

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message }) => {
      console.error('GraphQL Error:', message)
    })
  }
  if (networkError) {
    console.error('Network Error:', networkError)
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
