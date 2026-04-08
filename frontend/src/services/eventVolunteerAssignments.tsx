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
query getEventVolunteerAssignments($eventId: ID, $eventVersionId: ID, $workshopId: ID, $workshopVersionId: ID, $roleId: ID) {
  eventVolunteerAssignments(eventId: $eventId, eventVersionId: $eventVersionId, workshopId: $workshopId, workshopVersionId: $workshopVersionId, roleId: $roleId) {
    _id
    event { _id _versionId name }
    workshop { _id name }
    volunteer { _id name }
    role { _id name }
  }
}`), {
  filterCreated: (data, variables) => {
    if ('eventId' in data) {
      // Data from backend event is not fully normalized, so we need to check the fields directly instead of relying on the nested objects
      const item = data as { eventId?: string, roleId?: string, workshopId?: string | null }
      if (variables?.eventId != null && item.eventId !== variables.eventId) return false
      if (variables?.roleId != null && item.roleId !== variables.roleId) return false
      if (variables?.workshopId != null && item.workshopId !== variables.workshopId) return false
      return true
    }
    // Update from the frontend side
    if (variables?.eventId != null && data.event._id !== variables.eventId) return false
    if (variables?.roleId != null && data.role._id !== variables.roleId) return false
    if (variables?.workshopId != null && data.workshop?._id !== variables.workshopId) return false
    return true
  },
})

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
