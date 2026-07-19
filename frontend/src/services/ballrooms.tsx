import { entityCreateHook, entityDeleteHook, entityListQueryHook, entityUpdateHook, graphql, setupServiceUpdateFragment } from '../backend'

setupServiceUpdateFragment(
  'ballrooms',
  `fragment BallroomFragment on Ballroom {
    _id
    _versionId
    _versionNumber
    _updatedAt
    venueName
    roomName
    map
  }`,
)

export const useBallrooms = entityListQueryHook('ballrooms', graphql(`
query getBallrooms {
  ballrooms {
    _id
    _versionId
    _versionNumber
    _updatedAt
    venueName
    roomName
    map
  }
}`))

export const useCreateBallroom = entityCreateHook('ballrooms', graphql(`
mutation createBallroom($ballroom: BallroomInput!) {
  createBallroom(ballroom: $ballroom) {
    _id
    _versionId
    _versionNumber
    _updatedAt
    venueName
    roomName
    map
  }
}`))

export const usePatchBallroom = entityUpdateHook('ballrooms', graphql(`
mutation patchBallroom($id: ID!, $ballroom: JSONPatch!) {
  patchBallroom(id: $id, ballroom: $ballroom) {
    _id
    _versionId
    _versionNumber
    _updatedAt
    venueName
    roomName
    map
  }
}`))

export const useDeleteBallroom = entityDeleteHook('ballrooms', graphql(`
mutation deleteBallroom($id: ID!) {
  deleteBallroom(id: $id) {
    _id
    _versionId
    _versionNumber
    _updatedAt
    venueName
    roomName
    map
  }
}`))

export function formatBallroom(ballroom: { venueName: string, roomName?: string | null }) {
  return ballroom.roomName?.trim()
    ? `${ballroom.venueName} ${ballroom.roomName}`
    : ballroom.venueName
}
