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
      ballroom {
        _id
        venueName
        roomName
        map
      }
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
            formationDiagrams {
              _id
              description
              diagram
              ballroom {
                _id
                venueName
                roomName
                map
              }
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
            formationDiagrams {
              _id
              description
              diagram
              ballroom {
                _id
                venueName
                roomName
                map
              }
            }
          }
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
            formationDiagrams {
              _id
              description
              diagram
              ballroom {
                _id
                venueName
                roomName
                map
              }
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
