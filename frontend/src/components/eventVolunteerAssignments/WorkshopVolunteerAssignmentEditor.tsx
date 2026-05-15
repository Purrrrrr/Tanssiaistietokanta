import { Event, ID } from 'types'

import { useShowGlobalLoadingAnimation } from 'backend'
import { useEventVolunteerAssignments } from 'services/eventVolunteerAssignments'

import { PageSection } from 'libraries/ui'

import { AddVolunteerSelect } from './AddVolunteerSelect'
import { VolunteerAssignmentList } from './VolunteerAssignmentList'

export interface WorkshopVolunteerAssignmentEditorProps {
  id: string
  title: string
  event: Pick<Event, '_id' | '_versionId' | 'eventRegistrationSystem'>
  roleId: ID
  workshopId: ID
  workshopVersionId?: ID
  workshopInstances?: { _id: ID, abbreviation?: string | null }[]
}

export function WorkshopVolunteerAssignmentEditor({ title, id, event, roleId, workshopId, workshopVersionId, workshopInstances }: WorkshopVolunteerAssignmentEditorProps) {
  const { _id: eventId, _versionId: eventVersionId } = event
  const [currentAssignments = [], requestState] = useEventVolunteerAssignments({ eventId, eventVersionId, roleId, workshopId, workshopVersionId })

  useShowGlobalLoadingAnimation(requestState.loading)
  const readOnly = eventVersionId != null || workshopVersionId != null

  return <PageSection title={title}>
    <VolunteerAssignmentList
      showName
      assignments={currentAssignments}
      readOnly={readOnly}
      event={event}
      workshopInstances={workshopInstances}
    />
    {!readOnly &&
      <AddVolunteerSelect
        className="mb-6"
        id={id}
        currentAssignments={currentAssignments}
        eventId={eventId}
        roleId={roleId}
        workshopId={workshopId}
      />
    }
    {requestState.error && <div className="text-red-500">{requestState.error.message}</div>}
  </PageSection>
}
