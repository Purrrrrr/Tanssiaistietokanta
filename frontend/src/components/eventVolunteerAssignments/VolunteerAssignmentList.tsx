import { useId, useState } from 'react'
import { WorkshopLink } from 'routes/events/$eventId.{-$eventVersionId}/-components/WorkshopLink'

import { Event, EventVolunteerAssignment, ID } from 'types'

import { useSetEventVolunteerAssignmentRegistrationStatus, useSetEventVolunteerAssignmentWorkshopInstance } from 'services/eventVolunteerAssignments'

import { Callout, FormGroup, ItemList, Sort, ToolbarContainer } from 'libraries/ui'
import { RoleTag } from 'components/eventVolunteers/RoleTag'
import { SelectionBox } from 'components/widgets/SelectionBox'
import { useT } from 'i18n'
import { sortedBy } from 'utils/sorted'
import { useMultipleSelection } from 'utils/useMultipleSelection'

import RegistrationStatusLegend from './RegistrationStatusLegend'
import RegistrationStatusSelector from './RegistrationStatusSelector'
import { RemoveAssignmentsButton } from './RemoveVolunteerAssignmentButton'
import { WorkshopInstanceSelector } from './WorkshopInstanceSelector'

export interface VolunteerAssignmentListProps {
  showName?: boolean
  showRole?: boolean
  event: Pick<Event, '_id' | '_versionId' | 'eventRegistrationSystem' | 'workshops'>
  assignments: EventVolunteerAssignment[]
  readOnly?: boolean
  children?: React.ReactNode
}

export function VolunteerAssignmentList({
  showName = false,
  showRole = false,
  event,
  assignments: unsortedAssignments,
  readOnly,
  children,
}: VolunteerAssignmentListProps) {
  const id = useId()
  const { eventRegistrationSystem } = event
  const t = useT('components.volunteerAssignmentEditor')
  const status = useT('domain.eventVolunteer.shortEventVolunteerStatus')
  const [setAssignmentWorkshopInstance] = useSetEventVolunteerAssignmentWorkshopInstance()
  const [setAssignmentRegistrationStatus] = useSetEventVolunteerAssignmentRegistrationStatus()
  const [sort, setSort] = useState<Sort>({ key: showName ? 'name' : 'role', direction: 'asc' })
  const assignments = sortedBy(unsortedAssignments, { key: assignmentSorter(sort.key), direction: sort.direction }, a => a.volunteer.name)
  const { selected, ...selector } = useMultipleSelection(assignments)

  const setInstanceIds = async (assignment: EventVolunteerAssignment, instanceIds: ID[] | null) => {
    const workshopInstances = event.workshops.find(w => w._id === assignment.workshop?._id)?.instances ?? []
    const workshopInstanceIds = !instanceIds?.length
      ? null
      : instanceIds.length === workshopInstances.length
        ? null
        : instanceIds
    await setAssignmentWorkshopInstance({ id: assignment._id, workshopInstanceIds })
  }
  const hasWorkshops = assignments.some(a => a.workshop)
  const showWorkshops = showRole && hasWorkshops

  return <>
    {selected.length > 0 && (
      <ToolbarContainer className="justify-between">
        {t('selectedAssignments', { count: selected.length })}
        {!readOnly && <span>
          {eventRegistrationSystem !== 'None' && (
            <FormGroup inline label={t('setRegistrationStatus', { count: selected.length })} labelStyle="beside" labelFor={`${id}-registrationStatus-bulk`}>
              <RegistrationStatusSelector
                id={`${id}-registrationStatus-bulk`}
                value={selected.map(a => a.registrationStatus)}
                onChange={status => Promise.all(selected.map(a => setAssignmentRegistrationStatus({ id: a._id, registrationStatus: status })))}
                showText
              />
            </FormGroup>
          ) }
          <RemoveAssignmentsButton
            text={t('removeSelected', { count: selected.length })}
            assignments={selected}
          />
        </span>
        }
      </ToolbarContainer>
    )}
    <ItemList
      items={assignments}
      emptyText={t('noAssignments')}
      columns="grid-cols-[auto_1fr_max-content_1fr_max-content_auto]">
      <ItemList.SortableHeader
        currentSort={sort}
        onSort={setSort}
        columns={[
          { key: 'selectbox', label: <SelectionBox {...selector.selectAllProps} />, sortable: false },
          showName && { key: 'name', label: t('name') },
          showRole && { key: 'role', label: t('role') },
          showWorkshops && { key: 'workshop', label: t('workshop') },
          hasWorkshops && { key: 'instance', className: 'col-start-5', label: t('instance') },
          eventRegistrationSystem !== 'None' && { key: 'registrationStatus', className: 'col-start-6', label: t('registrationStatus') },
        ].filter(col => col !== false)}
      />
      {assignments.map(assignment => (
        <ItemList.Row key={assignment._id}>
          <SelectionBox {...selector.selectItemProps(assignment)} />
          {showName && <span>
            {assignment.volunteer.name}
            {assignment.eventVolunteer.status !== 'Accepted' && ` (${status(assignment.eventVolunteer.status)})`}
          </span>}
          {showRole && <span><RoleTag role={assignment.role} /></span>}
          {showWorkshops && (assignment.workshop ? <WorkshopLink workshop={assignment.workshop} /> : <span />)}
          <WorkshopInstanceSelector
            className="col-start-5"
            workshopInstances={event.workshops.find(w => w._id === assignment.workshop?._id)?.instances ?? []}
            assignment={assignment}
            readOnly={readOnly}
            setInstanceIds={setInstanceIds}
          />
          <span className="col-start-6 flex">
            {eventRegistrationSystem !== 'None' &&
              <RegistrationStatusSelector
                id={`${id}-registrationStatus-${assignment._id}`}
                value={assignment.registrationStatus}
                onChange={registrationStatus =>
                  setAssignmentRegistrationStatus({ id: assignment._id, registrationStatus })
                }
                disabled={readOnly}
              />
            }
            {!readOnly &&
              <RemoveAssignmentsButton
                text={t('removeVolunteer')}
                iconOnly
                assignments={[assignment]}
              />
            }
          </span>
        </ItemList.Row>
      ))}
    </ItemList>
    <Callout title={t('legend')}>
      <RegistrationStatusLegend />
    </Callout>
    {children}
  </>
}

function assignmentSorter(key: string) {
  switch (key) {
    default:
    case 'name':
      return (assignment: EventVolunteerAssignment) => assignment.volunteer.name
    case 'role':
      return (assignment: EventVolunteerAssignment) => assignment.role.name
    case 'workshop':
      return (assignment: EventVolunteerAssignment) => assignment.workshop?.name
    case 'instance':
      return (assignment: EventVolunteerAssignment) => assignment.workshopInstanceIds
    case 'registrationStatus':
      return (assignment: EventVolunteerAssignment) => assignment.registrationStatus
  }
}
