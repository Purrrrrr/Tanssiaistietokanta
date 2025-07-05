import {useMemo} from 'react'

import { backendQueryHook, entityCreateHook, entityDeleteHook, entityListQueryHook, entityUpdateHook, graphql, setupServiceUpdateFragment, useServiceEvents } from '../backend'

import './dances'
import './workshops'

export * from './slideStyles'

setupServiceUpdateFragment(
  'events',
  `fragment EventFragment on Event {
    _id, _versionId, _versionNumber, _updatedAt, name, beginDate, endDate,
    program {
      slideStyleId
      pauseBetweenDances
      defaultIntervalMusic {
        name
        description
      }
      introductions {
        title
        titleSlideStyleId
        program {
          _id
          slideStyleId
          item {
            __typename
            ... on ProgramItem {
              name
              duration
              description
            }
            ... on Dance {
              _id
            }
            ... on EventProgram {
              showInLists
            }
          }
        }
      }
      danceSets {
        _id
        title
        titleSlideStyleId
        program {
          _id
          item {
            __typename
            ... on ProgramItem {
              name
              duration
              description
            }
            ... on Dance {
              _id
            }
            ... on EventProgram {
              showInLists
            }
          }
          slideStyleId
        }
        intervalMusic {
          name
          description
          duration
          slideStyleId
        }
      }
    }
    workshops {
      _id
      name
      abbreviation
      description
      teachers
      instanceSpecificDances
      instances {
        _id
        dateTime
        durationInMinutes
        abbreviation
        dances {
          _id, name
        }
      }
    }
  }`
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
    program {
      slideStyleId
      pauseBetweenDances
      defaultIntervalMusic {
        name
        description
      }
      introductions {
        title
        titleSlideStyleId
        program {
          _id
          slideStyleId
          item {
            __typename
            ... on ProgramItem {
              name
              duration
              description
            }
            ... on Dance {
              _id
            }
            ... on EventProgram {
              showInLists
            }
          }
        }
      }
      danceSets {
        _id
        title
        titleSlideStyleId
        program {
          _id
          item {
            __typename
            ... on ProgramItem {
              name
              duration
              description
            }
            ... on Dance {
              _id
              wikipageName
              wikipage {
                instructions
              }
              teachedIn(eventId: $id) {
                _id
                workshop { name, abbreviation }
                instances { _id, abbreviation }
              }
            }
            ... on EventProgram {
              showInLists
            }
          }
          slideStyleId
        }
        intervalMusic {
          name
          description
          duration
          slideStyleId
        }
      }
    }
    workshops {
      _id
      name
      abbreviation
      description
      teachers
      instanceSpecificDances
      instances {
        _id
        dateTime
        durationInMinutes
        abbreviation
        dances {
          _id, name
        }
      }
    }
  }
}`), ({refetch, variables}) => {
  if (variables === undefined) throw new Error('Unknown event id')
  useCallbackOnEventChanges(variables.id, refetch)
})
export function useEvent(id: string, versionId?: string) {
  const res = useEventInternal({id, versionId})
  return [res?.data?.event, res] as const
}

export const useEvents = entityListQueryHook('events', graphql(`
query getEvents {
  events {
    _id, _versionId, name, beginDate, endDate
  }
}`))

export const useCreateEvent = entityCreateHook('events', graphql(`
mutation createEvent($event: EventInput!) {
  createEvent(event: $event) {
    _id, _versionId, name, beginDate, endDate
  }
}`))

export const usePatchEvent = entityUpdateHook('events', graphql(`
mutation patchEvent($id: ID!, $event: EventPatchInput!) {
  patchEvent(id: $id, event: $event) {
    _id, _versionId, name, beginDate, endDate
  }
}`))

export const usePatchEventProgram = entityUpdateHook('events', graphql(`
mutation patchEventProgram($id: ID!, $program: JSONPatch!) {
  patchEventProgram(id: $id, program: $program) {
    _id, _versionId, _versionNumber, name, beginDate, endDate,
    program {
      slideStyleId
      pauseBetweenDances
      defaultIntervalMusic {
        name
        description
      }
      introductions {
        title
        titleSlideStyleId
        program {
          _id
          slideStyleId
          item {
            __typename
            ... on ProgramItem {
              name
              duration
              description
            }
            ... on Dance {
              _id
              teachedIn(eventId: $id) {
                _id
                workshop { name, abbreviation }
                instances { _id, abbreviation }
              }
            }
            ... on EventProgram {
              showInLists
            }
          }
        }
      }
      danceSets {
        _id
        title
        titleSlideStyleId
        program {
          _id
          item {
            __typename
            ... on ProgramItem {
              name
              duration
              description
            }
            ... on Dance {
              _id
            }
            ... on EventProgram {
              showInLists
            }
          }
          slideStyleId
        }
        intervalMusic {
          name
          description
          duration
          slideStyleId
        }
      }
    }
    workshops {
      _id
      name
      abbreviation
      description
      teachers
      instanceSpecificDances
      instances {
        _id
        dateTime
        durationInMinutes
        abbreviation
        dances {
          _id, name
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
      console.log('Event has changed, running callback')
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
}
