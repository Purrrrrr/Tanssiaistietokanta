import type { CodegenConfig } from '@graphql-codegen/cli'

import devConfig from './src/devConfig'

const config: CodegenConfig = {
  overwrite: true,
  schema: devConfig.backendUrl+'/graphql',
  documents: ['src/**/*.ts', 'src/**/*.tsx'],
  generates: {
    'src/types/gql/': {
      preset: 'client',
      plugins: [],
      config: {
        enumsAsConst: true,
        nonOptionalTypename: false,
        scalars: {
          Tags: 'Record<string, boolean>',
        },
      },
    }
  }
}

export default config
