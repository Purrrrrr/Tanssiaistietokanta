import { backendQueryHook, graphql } from 'backend'
import { useCallbackOnEventChanges } from 'services/events'

type BallProgramData = ReturnType<typeof useBallProgramQuery>
export type Event = NonNullable<NonNullable<BallProgramData['data']>['event']>

export const useBallProgramQuery = backendQueryHook(graphql(`
query BallProgram($eventId: ID!, $eventVersionId: ID) {
  event(id: $eventId, versionId: $eventVersionId) {
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
          danceId
          dance {
            _id
            _versionId
            name
            description
            duration
            source
            teachedIn(eventId: $eventId) { 
              _id
              workshop { _id, _versionId, name }
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
          danceId
          dance {
            _id
            _versionId
            name
            description
            duration
            source
            teachedIn(eventId: $eventId) { 
              _id
              workshop { _id, _versionId, name }
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
