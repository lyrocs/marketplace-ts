import { DocumentNode, print } from 'graphql'

// Match the client-side configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/graphql'

// Ensure URL ends with /graphql
const GRAPHQL_ENDPOINT = API_URL.endsWith('/graphql') ? API_URL : `${API_URL}/graphql`

// Server-side GraphQL fetch using native fetch
export async function fetchGraphQL<T = any>(
  query: DocumentNode,
  variables?: Record<string, any>
): Promise<T> {
  try {
    console.log('[Server] Fetching from:', GRAPHQL_ENDPOINT)

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: print(query),
        variables,
      }),
      cache: 'no-store', // Disable Next.js cache for dynamic data
      next: {
        revalidate: 0, // Always fetch fresh data
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Server] GraphQL request failed:', {
        status: response.status,
        statusText: response.statusText,
        url: GRAPHQL_ENDPOINT,
        error: errorText,
      })
      throw new Error(`GraphQL request failed: ${response.status} - ${response.statusText}`)
    }

    const result = await response.json()

    if (result.errors) {
      console.error('GraphQL Errors:', result.errors)
      throw new Error(result.errors[0]?.message || 'GraphQL Error')
    }

    return result.data
  } catch (error) {
    console.error('Server-side GraphQL fetch error:', error)
    throw error
  }
}

// Cached version for static data (optional - use for data that doesn't change often)
export async function fetchGraphQLCached<T = any>(
  query: DocumentNode,
  variables?: Record<string, any>,
  revalidate: number = 60 // revalidate every 60 seconds
): Promise<T> {
  try {
    console.log('[Server] Fetching (cached) from:', GRAPHQL_ENDPOINT, `(revalidate: ${revalidate}s)`)

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: print(query),
        variables,
      }),
      next: {
        revalidate, // Revalidate at specified interval
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Server] GraphQL request failed:', {
        status: response.status,
        statusText: response.statusText,
        url: GRAPHQL_ENDPOINT,
        error: errorText,
      })
      throw new Error(`GraphQL request failed: ${response.status} - ${response.statusText}`)
    }

    const result = await response.json()

    if (result.errors) {
      console.error('GraphQL Errors:', result.errors)
      throw new Error(result.errors[0]?.message || 'GraphQL Error')
    }

    return result.data
  } catch (error) {
    console.error('Server-side GraphQL fetch error:', error)
    throw error
  }
}
