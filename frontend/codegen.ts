import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  overwrite: true,
  schema: 'http://localhost:8082/graphql',
  documents: ['src/**/*.ts', 'src/**/*.tsx'],
  generates: {
    'src/types/gql/': {
      preset: 'client',
      plugins: [],
      config: {
        nonOptionalTypename: false,
      },
    }
  }
}

export default config
