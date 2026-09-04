import type { CodegenConfig } from '@graphql-codegen/cli'

import devConfig from './src/devConfig'

const config: CodegenConfig = {
  overwrite: true,
  schema: devConfig.backendUrl+'/graphql',
  generates: {
    'src/types/gql/base-types.ts': {
      plugins: ['typescript'],
      config: {
        avoidOptionals: {
          variableValue: false,
          inputValue: false,
          defaultValue: false,
        },
        enumsAsTypes: true,
        maybeValue: 'T | null | undefined',
        scalars: {
          Tags: 'Record<string, boolean>',
          DocumentContent: 'import(\'libraries/lexical/utils/minify\').MinifiedDocumentContent',
          Diagram: 'import(\'libraries/fabric/types\').FabricDiagramData',
        },
      },
    }
  }
}

export default config
