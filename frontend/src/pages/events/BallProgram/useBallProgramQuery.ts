import {backendQueryHook, graphql} from 'backend'
import {useCallbackOnEventChanges} from 'services/events'

type BallProgramData = ReturnType<typeof useBallProgramQuery>
export type Event = NonNullable<NonNullable<BallProgramData['data']>['event']>

export const useBallProgramQuery = backendQueryHook(graphql(`
query BallProgram($eventId: ID!) {
  event(id: $eventId) {
    _id
    _versionId
    name
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
          item {
            __typename
            ... on ProgramItem {
              name
              description
              duration
            }
            ... on Dance {
              _id
              source
              teachedIn(eventId: $eventId) { 
                _id
                workshop { name }
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
        __typename
        _id
        title
        titleSlideStyleId
        intervalMusic {
          name
          description
          duration
          slideStyleId
          showInLists
        }
        program {
          _id
          slideStyleId
          item {
            __typename
            ... on ProgramItem {
              name
              description
              duration
            }
            ... on Dance {
              _id
              source
              teachedIn(eventId: $eventId) { 
                _id
                workshop { name }
                instances { _id, abbreviation }
              }
            }
            ... on EventProgram {
              showInLists
            }
          }
        }
      }
    }
  }
}`), ({refetch, variables}) => {
  if (variables === undefined) throw new Error('Unknown event id')
  useCallbackOnEventChanges(variables.eventId, refetch)
})
