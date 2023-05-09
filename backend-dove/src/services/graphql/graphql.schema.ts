import { print } from 'graphql'
import { loadFilesSync } from '@graphql-tools/load-files'
import { mergeTypeDefs } from '@graphql-tools/merge'

const types = loadFilesSync(`${__dirname}/../**/*.schema.graphql`)

export default print(mergeTypeDefs(types))
