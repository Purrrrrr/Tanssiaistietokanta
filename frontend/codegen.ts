import type { CodegenConfig } from '@graphql-codegen/cli'

import devConfig from './src/devConfig.json'

const config: CodegenConfig = {
  overwrite: true,
  schema: devConfig.backendUrl+'/graphql',
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
