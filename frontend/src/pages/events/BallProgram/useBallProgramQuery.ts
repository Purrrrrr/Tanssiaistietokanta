import {backendQueryHook, graphql} from 'backend'
import {useCallbackOnEventChanges} from 'services/events'

export const useBallProgramQuery = backendQueryHook(graphql(`
query BallProgram($eventId: ID!) {
  event(id: $eventId) {
    _id
    name
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
              description
              duration
            }
            ... on Dance {
              _id
              source
              teachedIn(eventId: $eventId) { _id, name }
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
              teachedIn(eventId: $eventId) { _id, name }
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
