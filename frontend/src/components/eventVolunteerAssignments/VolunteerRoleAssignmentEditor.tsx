import { Event, ID } from 'types'

import { useShowGlobalLoadingAnimation } from 'backend'
import { useEventVolunteerAssignments } from 'services/eventVolunteerAssignments'

import { PageSection } from 'libraries/ui'

import { VolunteerAssignmentList } from './VolunteerAssignmentList'
import { VolunteerRoleSelect } from './VolunteerRoleSelect'

export interface VolunteerRoleAssignmentEditorProps {
  id: string
  title: string
  event: Pick<Event, '_id' | '_versionId' | 'eventRegistrationSystem' | 'workshops'>
  volunteerId: ID
}

export function VolunteerRoleAssignmentEditor({ title, id, event, volunteerId }: VolunteerRoleAssignmentEditorProps) {
  const { _id: eventId, _versionId: eventVersionId } = event
  const [currentAssignments = [], requestState] = useEventVolunteerAssignments({ eventId, eventVersionId, volunteerId })

  useShowGlobalLoadingAnimation(requestState.loading)
  const readOnly = eventVersionId != null

  return <PageSection title={title}>
    <VolunteerAssignmentList
      showRole
      assignments={currentAssignments}
      readOnly={readOnly}
      event={event}
    />
    {!readOnly &&
      <VolunteerRoleSelect
        id={id}
        currentAssignments={currentAssignments}
        event={event}
        volunteerId={volunteerId}
      />
    }
    {requestState.error && <div className="text-red-500">{requestState.error.message}</div>}
  </PageSection>
}
