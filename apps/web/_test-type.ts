import { graphql } from './graphql/__generated__/gql'
import { useQuery } from '@apollo/client/react'

const ME_QUERY = graphql(`
  query Me {
    me {
      id
      name
      email
      image
      role
    }
  }
`)

function test() {
  const { data } = useQuery(ME_QUERY)
  // If typed correctly, data?.me should work
  const me = data?.me
}
