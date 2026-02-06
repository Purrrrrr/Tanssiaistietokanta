import { GetUsersQuery } from 'types/gql/graphql'

export type UserListItem = NonNullable<GetUsersQuery['users']>[0]
