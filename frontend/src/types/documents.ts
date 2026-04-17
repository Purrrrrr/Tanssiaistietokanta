import { CreateDocumentMutationVariables, GetDocumentQuery, GetDocumentsQuery } from 'types/gql/graphql'

export type DocumentInput = CreateDocumentMutationVariables
export type DocumentListItem = NonNullable<GetDocumentsQuery['documents']>[number]
export type Document = NonNullable<GetDocumentQuery['document']>
export type DocumentOwner = Document['owner']
