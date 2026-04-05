import { entityCreateHook, entityDeleteHook, entityListQueryHook, entityUpdateHook, graphql, setupServiceUpdateFragment } from '../backend'

setupServiceUpdateFragment(
  'volunteers',
  `fragment VolunteerFragment on Volunteer {
    _id
    name
    volunteeredIn {
      workshop {
        _id
        name
        event {
          _id
          _versionId
          beginDate
          name
        }
      }
    }
  }`,
)

export const useVolunteers = entityListQueryHook('volunteers', graphql(`
query getVolunteers {
  volunteers {
    _id
    name
    volunteeredIn {
      workshop {
        _id
        name
        event {
          _id
          _versionId
          beginDate
          name
        }
      }
    }
  }
}`))

export const useVolunteerNames = entityListQueryHook('volunteers', graphql(`
query getVolunteerNames {
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
    volunteeredIn {
      workshop {
        _id
        name
        event {
          _id
          _versionId
          beginDate
          name
        }
      }
    }
  }
}`))

export const usePatchVolunteer = entityUpdateHook('volunteers', graphql(`
mutation patchVolunteer($id: ID!, $volunteer: VolunteerPatchInput!) {
  patchVolunteer(id: $id, volunteer: $volunteer) {
    _id
    name
    volunteeredIn {
      workshop {
        _id
        name
        event {
          _id
          _versionId
          beginDate
          name
        }
      }
    }

  }
}`))

export const useDeleteVolunteer = entityDeleteHook('volunteers', graphql(`
mutation deleteVolunteer($id: ID!) {
  deleteVolunteer(id: $id) {
    _id
    name
    volunteeredIn {
      workshop {
        _id
        name
        event {
          _id
          _versionId
          name
        }
      }
    }
  }
}`))
