import type { CodegenConfig } from '@graphql-codegen/cli'

import devConfig from './src/devConfig'
import { makeNullableFieldsOptional } from './makeNullableGraphQLFieldsOptional'

const config: CodegenConfig = {
  overwrite: true,
  schema: devConfig.backendUrl+'/graphql',
  documents: ['src/**/*.ts', 'src/**/*.tsx'],
  generates: {
    'src/types/gql/': {
      preset: 'client',
      plugins: [],
      documentTransforms: [makeNullableFieldsOptional],
      config: {
        nonOptionalTypename: true,
        skipTypeNameForRoot: false,
        avoidOptionals: {
          variableValue: false,
          inputValue: false,
          defaultValue: false,
        },
        maybeValue: 'T | null | undefined',
        scalars: {
          Tags: 'Record<string, boolean>',
          DocumentContent: 'import(\'@/libraries/lexical/utils/minify\').MinifiedDocumentContent',
          Diagram: 'import(\'@/libraries/fabric/types\').FabricDiagramData',
        },
      },
    }
  }
}

export default config
