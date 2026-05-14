import { Event } from 'types'

import { useShowGlobalLoadingAnimation } from 'backend'
import { useEventVolunteerAssignments } from 'services/eventVolunteerAssignments'

import { VolunteerAssignmentList } from './VolunteerAssignmentList'

export interface VolunteerAssignmentEditorProps {
  id: string
  title: string
  event: Pick<Event, '_id' | '_versionId' | 'eventRegistrationSystem'>
}

export function VolunteerAssignmentEditor({ title, id, event }: VolunteerAssignmentEditorProps) {
  const { _id: eventId, _versionId: eventVersionId } = event
  const [currentAssignments = [], requestState] = useEventVolunteerAssignments({ eventId, eventVersionId })

  useShowGlobalLoadingAnimation(requestState.loading)
  const readOnly = eventVersionId != null

  return <VolunteerAssignmentList
    showName
    showRole
    assignments={currentAssignments}
    title={title}
    readOnly={readOnly}
    event={event}
  >
    {requestState.error && <div className="text-red-500">{requestState.error.message}</div>}
  </VolunteerAssignmentList>
}
