import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: '../back/src/schema.gql',
  documents: ['graphql/**/*.ts', 'app/**/*.tsx', 'components/**/*.tsx', 'hooks/**/*.tsx'],
  generates: {
    './graphql/__generated__/': {
      preset: 'client',
    },
  },
}

export default config
