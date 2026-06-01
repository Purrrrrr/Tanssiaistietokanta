import { useState } from 'react'

import { Event } from 'types'

import { useShowGlobalLoadingAnimation } from 'backend'
import { useEventVolunteerAssignments } from 'services/eventVolunteerAssignments'

import { Collapse, PageSection } from 'libraries/ui'
import { AddButton } from 'components/widgets/AddButton'
import { useTranslation } from 'i18n'

import { AddVolunteerAssignmentForm } from './AddVolunteerAssignmentForm'
import { AssignmentWarnings } from './AssignmentWarnings'
import { VolunteerAssignmentList } from './VolunteerAssignmentList'
import { AssignmentSearchTerm, searchAssignments, VolunteerAssignmentSearch } from './VolunteerAssignmentSearch'

export interface VolunteerAssignmentEditorProps {
  id: string
  title: string
  event: Pick<Event, '_id' | '_versionId' | 'eventRegistrationSystem' | 'workshops'>
  search?: AssignmentSearchTerm[]
  onSetSearch: (search: AssignmentSearchTerm[]) => void
}

export function VolunteerAssignmentEditor({ title, id, event, search = [], onSetSearch }: VolunteerAssignmentEditorProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { _id: eventId, _versionId: eventVersionId } = event
  const [unfilteredAssignments = [], requestState] = useEventVolunteerAssignments({ eventId, eventVersionId })
  const assignments = searchAssignments(unfilteredAssignments, search)

  useShowGlobalLoadingAnimation(requestState.loading)
  const readOnly = eventVersionId != null

  return <PageSection
    title={title}
    toolbar={<>
      <VolunteerAssignmentSearch id={`${id}-search`} value={search} onChange={onSetSearch} workshops={event.workshops} />
      <AddButton
        className="ms-2"
        text={useTranslation('components.volunteerAssignmentEditor.addAssignment')}
        onClick={() => setShowCreateForm(v => !v)}
        disabled={readOnly} />
    </>}
  >
    <Collapse isOpen={showCreateForm}>
      <AddVolunteerAssignmentForm event={event} currentAssignments={unfilteredAssignments} onClose={() => setShowCreateForm(false)} />
    </Collapse>
    <AssignmentWarnings event={event} />
    <VolunteerAssignmentList
      showName
      showRole
      assignments={assignments}
      readOnly={readOnly}
      event={event}
    />
    {requestState.error && <div className="text-red-500">{requestState.error.message}</div>}
  </PageSection>
}
