import { backendQueryHook, entityCreateHook, entityDeleteHook, entityListQueryHook, entityUpdateHook, graphql, setupServiceUpdateFragment } from '../backend'

setupServiceUpdateFragment(
  'eventVolunteers',
  `fragment EventVolunteerFragment on EventVolunteer {
    _id
    _versionId
    _versionNumber
    _updatedAt
    eventId
    volunteerId
    volunteer { _id name }
    interestedIn { _id name plural description appliesToWorkshops order }
    wishes
    notes
  }`,
)

export const useEventVolunteers = entityListQueryHook('eventVolunteers', graphql(`
query getEventVolunteers($eventId: ID, $volunteerId: ID) {
  eventVolunteers(eventId: $eventId, volunteerId: $volunteerId) {
    _id
    _versionId
    _versionNumber
    _updatedAt
    eventId
    volunteerId
    volunteer { _id name }
    interestedIn { _id name plural description appliesToWorkshops order }
    wishes
    notes
  }
}`))

export const useEventVolunteer = backendQueryHook(graphql(`
query getEventVolunteer($id: ID!, $versionId: ID) {
  eventVolunteer(id: $id, versionId: $versionId) {
    _id
    _versionId
    _versionNumber
    _updatedAt
    eventId
    volunteerId
    volunteer { _id name }
    interestedIn { _id name plural description appliesToWorkshops order }
    wishes
    notes
  }
}`))

export const useCreateEventVolunteer = entityCreateHook('eventVolunteers', graphql(`
mutation createEventVolunteer($eventVolunteer: EventVolunteerInput!) {
  createEventVolunteer(eventVolunteer: $eventVolunteer) {
    _id
    _versionId
    _versionNumber
    _updatedAt
    eventId
    volunteerId
    volunteer { _id name }
    interestedIn { _id name plural description appliesToWorkshops order }
    wishes
    notes
  }
}`))

export const useModifyEventVolunteer = entityUpdateHook('eventVolunteers', graphql(`
mutation modifyEventVolunteer($id: ID!, $eventVolunteer: EventVolunteerInput!) {
  modifyEventVolunteer(id: $id, eventVolunteer: $eventVolunteer) {
    _id
    _versionId
    _versionNumber
    _updatedAt
    eventId
    volunteerId
    volunteer { _id name }
    interestedIn { _id name plural description appliesToWorkshops order }
    wishes
    notes
  }
}`))

export const usePatchEventVolunteer = entityUpdateHook('eventVolunteers', graphql(`
mutation patchEventVolunteer($id: ID!, $eventVolunteer: EventVolunteerPatchInput!) {
  patchEventVolunteer(id: $id, eventVolunteer: $eventVolunteer) {
    _id
    _versionId
    _versionNumber
    _updatedAt
    eventId
    volunteerId
    volunteer { _id name }
    interestedIn { _id name plural description appliesToWorkshops order }
    wishes
    notes
  }
}`))

export const useDeleteEventVolunteer = entityDeleteHook('eventVolunteers', graphql(`
mutation deleteEventVolunteer($id: ID!) {
  deleteEventVolunteer(id: $id) {
    _id
    _versionId
    _versionNumber
    _updatedAt
    eventId
    volunteerId
    volunteer { _id name }
    interestedIn { _id name plural description appliesToWorkshops order }
    wishes
    notes
  }
}`))
