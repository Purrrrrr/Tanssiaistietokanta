import { EditableBallroom } from 'types'

export type BallroomFormValues = Pick<EditableBallroom, 'venueName' | 'roomName' | 'map'>

export const emptyBallroomForm: BallroomFormValues = {
  venueName: '',
  roomName: '',
  map: null,
}
