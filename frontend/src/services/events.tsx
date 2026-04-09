import { useMemo } from 'react'

import { backendQueryHook, entityCreateHook, entityDeleteHook, entityListQueryHook, entityUpdateHook, graphql, setupServiceUpdateFragment, useServiceEvents } from '../backend'

import './dances'
import './workshops'
import './eventVolunteerAssignments'

export * from './slideStyles'

setupServiceUpdateFragment(
  'events',
  `fragment EventFragment on Event {
    _id, _versionId, _versionNumber, _updatedAt, name, beginDate, endDate,
    accessControl {
      viewAccess
      grants {
        _id
        principal
        role
      }
    }
    program {
      dateTime
      slideStyleId
      pauseBetweenDances
      defaultIntervalMusic {
        name
        description
        showInLists
      }
      introductions {
        title
        titleSlideStyleId
        program {
          _id
          slideStyleId
          type
          eventProgram {
            name
            description
            duration
            showInLists
          }
        }
      }
      danceSets {
        _id
        title
        titleSlideStyleId
        program {
          _id
          type
          eventProgram {
            name
            description
            duration
            showInLists
          }
          danceId
          dance {
            _id
            _versionId
            name
            duration
            description
            wikipageName
            wikipage {
              instructions
            }
            teachedIn(eventId: $id) {
              _id
              workshop { _id, _versionId, name, abbreviation }
              instances { _id, abbreviation }
            }
          }
          slideStyleId
        }
        intervalMusic {
          name
          description
          duration
          slideStyleId
          danceId
          dance {
            _id, _versionId, name
          }
          showInLists
        }
      }
    }
  }`,
)

export const useEventVersions = backendQueryHook(graphql(`
query getEventVersions($id: ID!) {
  event(id: $id) {
    _id, _versionId,
    name
    versionHistory {
      calendar {
        date
        versions {
          _versionId
          _versionNumber
          _updatedAt
        }
      }
    }
  }
}`))

const useEventInternal = backendQueryHook(graphql(`
query getEvent($id: ID!, $versionId: ID) {
  event(id: $id, versionId: $versionId) {
    _id, _versionId, _versionNumber, _updatedAt, name, beginDate, endDate,
    accessControl {
      viewAccess
      grants {
        _id
        principal
        role
      }
    }
    program {
      dateTime
      slideStyleId
      pauseBetweenDances
      defaultIntervalMusic {
        name
        description
        showInLists
      }
      introductions {
        title
        titleSlideStyleId
        program {
          _id
          slideStyleId
          type
          eventProgram {
            name
            description
            duration
            showInLists
          }
        }
      }
      danceSets {
        _id
        title
        titleSlideStyleId
        program {
          _id
          type
          eventProgram {
            name
            description
            duration
            showInLists
          }
          danceId
          dance {
            _id
            _versionId
            name
            duration
            description
            wikipageName
            wikipage {
              instructions
            }
            teachedIn(eventId: $id) {
              _id
              workshop { _id, _versionId, name, abbreviation }
              instances { _id, abbreviation }
            }
          }
          slideStyleId
        }
        intervalMusic {
          name
          description
          duration
          slideStyleId
          danceId
          dance {
            _id, _versionId, name
          }
          showInLists
        }
      }
    }
    workshops {
      _id
      _versionId
      name
      abbreviation
      description
      volunteerAssignments {
        _id
        _eventId
        _workshopId
        volunteers { _id name }
        role { _id name type }
      }
      volunteerAssignments {
        _id _eventId _workshopId
        volunteers { _id name }
        role { _id name type }
      }
      instanceSpecificDances
      instances {
        _id
        dateTime
        durationInMinutes
        abbreviation
        dances {
          _id, _versionId, name
        }
      }
    }
  }
}`), ({ refetch, variables }) => {
  if (variables === undefined) throw new Error('Unknown event id')
  useCallbackOnEventChanges(variables.id, refetch)
})
export function useEvent(id: string, versionId?: string) {
  const res = useEventInternal({ id, versionId })
  return [res?.data?.event, res] as const
}
useEvent.query = useEventInternal.query

export const useEvents = entityListQueryHook('events', graphql(`
query getEvents {
  events {
    _id, _versionId, name, beginDate, endDate,
    accessControl {
      viewAccess
      grants {
        _id
        principal
        role
      }
    }
  }
}`), {
  refetchOnUpdate: (old, updated) => {
    return !old || 'inaccessible' in updated
  },
})

export const useCreateEvent = entityCreateHook('events', graphql(`
mutation createEvent($event: EventInput!) {
  createEvent(event: $event) {
    _id, _versionId, name, beginDate, endDate,
    accessControl {
      viewAccess
      grants {
        _id
        principal
        role
      }
    }
  }
}`))

export const usePatchEvent = entityUpdateHook('events', graphql(`
mutation patchEvent($id: ID!, $event: JSONPatch!) {
  patchEvent(id: $id, event: $event) {
    _id, _versionId, name, beginDate, endDate,
    accessControl {
      viewAccess
      grants {
        _id
        principal
        role
      }
    }
  }
}`))

export const usePatchEventProgram = entityUpdateHook('events', graphql(`
mutation patchEventProgram($id: ID!, $program: JSONPatch!) {
  patchEventProgram(id: $id, program: $program) {
    _id, _versionId, _versionNumber, name, beginDate, endDate,
    accessControl {
      viewAccess
      grants {
        _id
        principal
        role
      }
    }
    program {
      dateTime
      slideStyleId
      pauseBetweenDances
      defaultIntervalMusic {
        name
        description
        showInLists
      }
      introductions {
        title
        titleSlideStyleId
        program {
          _id
          slideStyleId
          type
          eventProgram {
            name
            description
            duration
            showInLists
          }
        }
      }
      danceSets {
        _id
        title
        titleSlideStyleId
        program {
          _id
          type
          eventProgram {
            name
            description
            duration
            showInLists
          }
          danceId
          dance {
            _id
            _versionId
            name
            duration
            description
            wikipageName
            wikipage {
              instructions
            }
            teachedIn(eventId: $id) {
              _id
              workshop { _id, _versionId, name, abbreviation }
              instances { _id, abbreviation }
            }
          }
          slideStyleId
        }
        intervalMusic {
          name
          description
          duration
          slideStyleId
          danceId
          dance {
            _id, _versionId, name
          }
          showInLists
        }
      }
    }
    workshops {
      _id
      _versionId
      name
      abbreviation
      description
      volunteerAssignments {
        _id
        _eventId
        _workshopId
        volunteers { _id name }
        role { _id name type }
      }
      volunteerAssignments {
        _id _eventId _workshopId
        volunteers { _id name }
        role { _id name type }
      }
      instanceSpecificDances
      instances {
        _id
        dateTime
        durationInMinutes
        abbreviation
        dances {
          _id, _versionId, name
        }
      }
    }
  }
}`))

export const useDeleteEvent = entityDeleteHook('events', graphql(`
mutation deleteEvent($id: ID!) {
  deleteEvent(id: $id) {
    _id, _versionId, name
  }
}`))

export function useCallbackOnEventChanges(eventId, callback) {
  const callbacks = useMemo(() => {
    const updateFn = () => {
      callback()
    }
    return {
      created: updateFn,
      updated: updateFn,
      removed: updateFn,
    }
  }, [callback])
  useServiceEvents('events', `events/${eventId}`, callbacks)
  useServiceEvents('workshops', `events/${eventId}/workshops`, callbacks)
  useServiceEvents('dances', `events/${eventId}/dances`, callbacks)
  useServiceEvents('eventVolunteerAssignments', `events/${eventId}/eventVolunteerAssignments`, callbacks)
}
