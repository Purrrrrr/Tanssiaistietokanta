import { entityCreateHook, entityDeleteHook, entityListQueryHook, graphql, setupServiceUpdateFragment } from '../backend'

setupServiceUpdateFragment(
  'eventVolunteerAssignments',
  `fragment EventVolunteerAssignmentFragment on EventVolunteerAssignment {
    _id
    event { _id _versionId name }
    workshop { _id name }
    volunteer { _id name }
    role { _id name }
  }`,
)

export const useEventVolunteerAssignments = entityListQueryHook('eventVolunteerAssignments', graphql(`
query getEventVolunteerAssignments($eventId: ID, $workshopId: ID, $roleId: ID) {
  eventVolunteerAssignments(eventId: $eventId, workshopId: $workshopId, roleId: $roleId) {
    _id
    event { _id _versionId name }
    workshop { _id name }
    volunteer { _id name }
    role { _id name }
  }
}`))

export const useCreateEventVolunteerAssignment = entityCreateHook('eventVolunteerAssignments', graphql(`
mutation createEventVolunteerAssignment($eventVolunteerAssignment: EventVolunteerAssignmentInput!) {
  createEventVolunteerAssignment(eventVolunteerAssignment: $eventVolunteerAssignment) {
    _id
    event { _id _versionId name }
    workshop { _id name }
    volunteer { _id name }
    role { _id name }
  }
}`))

export const useDeleteEventVolunteerAssignment = entityDeleteHook('eventVolunteerAssignments', graphql(`
mutation deleteEventVolunteerAssignment($id: ID!) {
  deleteEventVolunteerAssignment(id: $id) {
    _id
    event { _id _versionId name }
    workshop { _id name }
    volunteer { _id name }
    role { _id name }
  }
}`))
