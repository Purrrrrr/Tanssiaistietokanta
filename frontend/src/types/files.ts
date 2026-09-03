import { GetFilesQuery, GetFilesQueryVariables } from 'types/gql/graphql'

export type File = GetFilesQuery['files'][0]

export type { FetchRequestProgress } from 'backend'
export type { FileOwner } from 'types/gql/graphql'
export type FileOwningId = GetFilesQueryVariables['owningId']
