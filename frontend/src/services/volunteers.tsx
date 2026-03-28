import { entityCreateHook, entityDeleteHook, entityListQueryHook, entityUpdateHook, graphql, setupServiceUpdateFragment } from '../backend'

setupServiceUpdateFragment(
  'volunteers',
  `fragment VolunteerFragment on Volunteer {
    _id
    name
  }`,
)

export const useVolunteers = entityListQueryHook('volunteers', graphql(`
query getVolunteers {
  volunteers {
    _id
    name
  }
}`))

export const useCreateVolunteer = entityCreateHook('volunteers', graphql(`
mutation createVolunteer($volunteer: VolunteerInput!) {
  createVolunteer(volunteer: $volunteer) {
    _id
    name
  }
}`))

export const usePatchVolunteer = entityUpdateHook('volunteers', graphql(`
mutation patchVolunteer($id: ID!, $volunteer: VolunteerPatchInput!) {
  patchVolunteer(id: $id, volunteer: $volunteer) {
    _id
    name
  }
}`))

export const useDeleteVolunteer = entityDeleteHook('volunteers', graphql(`
mutation deleteVolunteer($id: ID!) {
  deleteVolunteer(id: $id) {
    _id
    name
  }
}`))
