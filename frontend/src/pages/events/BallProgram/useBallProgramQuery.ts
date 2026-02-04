import { backendQueryHook, graphql } from 'backend'
import { useCallbackOnEventChanges } from 'services/events'

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
          type
          eventProgram {
            name
            description
            duration
            showInLists
          }
          dance {
            _id
            name
            description
            duration
            source
            teachedIn(eventId: $eventId) { 
              _id
              workshop { name }
              instances { _id, abbreviation }
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
          type
          slideStyleId
          eventProgram {
            name
            description
            duration
            showInLists
          }
          dance {
            _id
            name
            description
            duration
            source
            teachedIn(eventId: $eventId) { 
              _id
              workshop { name }
              instances { _id, abbreviation }
            }
          }
        }
      }
    }
  }
}`), ({ refetch, variables }) => {
  if (variables === undefined) throw new Error('Unknown event id')
  useCallbackOnEventChanges(variables.eventId, refetch)
})
