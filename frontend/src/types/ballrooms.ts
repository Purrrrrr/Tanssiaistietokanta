import { WithoutMetadata } from './backend'
import { BallroomInput, GetBallroomsQuery } from './gql/graphql'

export type Ballroom = GetBallroomsQuery['ballrooms'][0]
export type EditableBallroom = WithoutMetadata<Ballroom>
export type { BallroomInput }
