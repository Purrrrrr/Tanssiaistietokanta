import { Event } from 'types'

import { useShowGlobalLoadingAnimation } from 'backend'
import { useEventVolunteerAssignments } from 'services/eventVolunteerAssignments'

import { PageSection, SearchBar } from 'libraries/ui'
import { useTranslation } from 'i18n'

import { AssignmentWarnings } from './AssignmentWarnings'
import { VolunteerAssignmentList } from './VolunteerAssignmentList'

export interface VolunteerAssignmentEditorProps {
  id: string
  title: string
  event: Pick<Event, '_id' | '_versionId' | 'eventRegistrationSystem'>
  search?: string
  onSetSearch: (search: string) => void
}

export function VolunteerAssignmentEditor({ title, id, event, search, onSetSearch }: VolunteerAssignmentEditorProps) {
  const { _id: eventId, _versionId: eventVersionId } = event
  const [unfilteredAssignments = [], requestState] = useEventVolunteerAssignments({ eventId, eventVersionId })
  const assignments = search
    ? unfilteredAssignments.filter(a => {
      const searchLower = search.toLowerCase()
      const names = [a.volunteer.name, a.role.name, a.workshop?.name]
        .filter(name => name !== undefined)
        .map(s => s.toLowerCase())
      return names.some(name => name.includes(searchLower))
    })
    : unfilteredAssignments

  useShowGlobalLoadingAnimation(requestState.loading)
  const readOnly = eventVersionId != null

  return <PageSection
    title={title}
    toolbar={<SearchBar
      id={`${id}-search`}
      value={search ?? ''}
      onChange={onSetSearch}
      placeholder={useTranslation('common.search')}
      emptySearchText={useTranslation('common.emptySearch')}
    />}
  >
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
