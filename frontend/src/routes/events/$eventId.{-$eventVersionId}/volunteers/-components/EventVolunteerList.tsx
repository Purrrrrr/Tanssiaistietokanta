import { useState } from 'react'

import { EventRole, EventVolunteer, VolunteerListItem } from 'types'

import { usePatchEventVolunteer } from 'services/eventVolunteers'

import { patchStrategy, useAutosavingState } from 'libraries/forms'
import { Button, FormGroup } from 'libraries/ui'
import { ChevronDown, ChevronUp, Edit, EyeOpen, Pin, Search } from 'libraries/ui/icons'
import { ItemList, Sort } from 'libraries/ui/ItemList'
import { VolunteerAssignmentEditor } from 'components/eventVolunteerAssignments/VolunteerAssignmentEditor'
import { RoleTag } from 'components/eventVolunteers/RoleTag'
import { VolunteerStatusBulkSelector } from 'components/eventVolunteers/VolunteerStatusBulkSelector'
import { SelectionBox } from 'components/widgets/SelectionBox'
import { useT, useTranslation } from 'i18n'
import { sortedBy } from 'utils/sorted'
import { useMultipleSelection } from 'utils/useMultipleSelection'

import { WorkshopLink } from '../../-components/WorkshopLink'
import { DeleteEventVolunteerButton } from './DeleteEventVolunteerButton'
import { EventVolunteerForm, EventVolunteerFormValues } from './EventVolunteerForm'

export interface EventVolunteerListProps {
  eventVolunteers: EventVolunteer[]
  readOnly?: boolean
  currentRole?: string
  onSetRole: (roleId: string | undefined) => void
}

export function EventVolunteerList({ eventVolunteers: unsorted, readOnly, currentRole, onSetRole }: EventVolunteerListProps) {
  const t = useT('routes.events.event.volunteers')
  const label = useT('domain.eventVolunteer')
  const [sort, setSort] = useState<Sort>({ key: 'taskRoles', direction: 'asc' })

  const eventVolunteers = sortedBy(unsorted, { key: volunteerSorter(sort.key), direction: sort.direction }, volunteer => volunteer.volunteer.name)
  const addedVolunteers = eventVolunteers.map(ev => ev.volunteer)
  const { selected, ...selector } = useMultipleSelection(eventVolunteers)

  return <>
    <div className="flex gap-2 justify-between items-center mb-2">
      <span>
        {eventVolunteers.length > 0 && t('Nvolunteers', { count: eventVolunteers?.length })}
        {selected.length > 0 && ', ' + t('selectedVolunteers', { count: selected.length })}
      </span>
      <div>
        {selected.length > 0 &&
          <FormGroup label={t('setStatus', { count: selected.length })} inline labelFor="statusBulkSelector">
            <VolunteerStatusBulkSelector id="statusBulkSelector" eventVolunteers={selected} />
          </FormGroup>
        }
      </div>
    </div>
    <ItemList
      items={eventVolunteers}
      emptyText={t('noVolunteers')}
      columns="grid-cols-[auto_max-content_auto_auto_auto_1fr_1fr_max-content]"
    >
      <ItemList.SortableHeader currentSort={sort} onSort={setSort} columns={[
        { key: 'select', sortable: false, label: <SelectionBox {...selector.selectAllProps} /> },
        { key: 'name', label: label('name') },
        { key: 'status', label: label('status') },
        { key: 'taskRoles', label: <>
          {label('taskRoles')}{' '}
          (<Pin className="align-text-top" size={14} /> = {label('assigned')} / <Search className="align-text-top" size={12} /> = {label('interested')})
        </> },
        { key: 'workshops', label: label('workshops') },
        { key: 'wishes', label: label('wishes') },
        { key: 'notes', label: label('notes') },
      ]} />
      {(eventVolunteers).map(ev => {
        const taskRoles = getTasksRoles(ev)
        const workshops = taskRoles.flatMap(r => r.workshops ?? [])
        return <EventVolunteerListRow
          key={ev._id}
          eventVolunteer={ev}
          addedVolunteers={addedVolunteers}
          readOnly={readOnly}
        >
          <SelectionBox {...selector.selectItemProps(ev)} />
          <span>{ev.volunteer.name}</span>
          <span>{label(`shortEventVolunteerStatus.${ev.status}`)}</span>
          <span>
            {taskRoles.map(role => (
              <RoleTag
                key={role._id}
                icon={role.assigned
                  ? <Pin className="align-text-top" size={14} />
                  : <Search className="align-text-top" size={12} />}
                role={role}
                selected={currentRole ? currentRole === role._id : undefined}
                onSetRole={onSetRole}
              />
            ))}
          </span>
          {workshops
            ? <span className="*:not-last:after:content-[',_']">
              {workshops.map(w => <WorkshopLink workshop={w} key={w._id} />)}
            </span>
            : <span className="italic text-gray-500">{label('noWorkshops')}</span>}
          <span>{ev.wishes ? ev.wishes : <span className="italic text-gray-500">{label('noWishes')}</span>}</span>
          <span>{ev.notes || '-'}</span>
        </EventVolunteerListRow>
      })}
    </ItemList>
  </>
}

interface TaskRole extends Pick<EventRole, '_id' | 'name' | 'order'> {
  assigned: boolean
  workshops?: { _id: string, name: string }[]
}

function getTasksRoles(ev: EventVolunteer): TaskRole[] {
  const assignmentsByRole = Map.groupBy(ev.assignments, ev => ev.role._id)
  const assignmentRoles = assignmentsByRole
    .values()
    .map(assignments => ({
      ...assignments[0].role,
      assigned: true,
      workshops: assignments.map(a => a.workshop).filter(w => w != null),
    }))
  const interestedInRoles = ev.interestedIn
    .filter(role => !assignmentsByRole.has(role._id))
    .map(role => ({
      ...role,
      assigned: false,
    }))

  return sortedBy([...assignmentRoles, ...interestedInRoles], 'order')
}

function volunteerSorter(key: string) {
  switch (key) {
    default:
    case 'status':
      return (ev: EventVolunteer) => ev.status
    case 'name':
      return (ev: EventVolunteer) => ev.volunteer.name
    case 'taskRoles':
      return (ev: EventVolunteer) => getTasksRoles(ev).map(role => [role.order, role.assigned])
    case 'workshops':
      return (ev: EventVolunteer) => {
        const names = ev.assignments.map(a => a.workshop).filter(w => w != null).map(w => w.abbreviation ?? w.name).sort()
        return names.length > 0 ? names : null
      }
    case 'wishes':
      return (ev: EventVolunteer) => ev.wishes ?? ''
    case 'notes':
      return (ev: EventVolunteer) => ev.notes ?? ''
  }
}

interface EventVolunteerListRowProps {
  eventVolunteer: EventVolunteer
  addedVolunteers: VolunteerListItem[]
  readOnly?: boolean
  children: React.ReactNode
}

function EventVolunteerListRow({ eventVolunteer: ev, addedVolunteers, readOnly, children }: EventVolunteerListRowProps) {
  const [showEditor, setShowEditor] = useState(false)

  return <ItemList.Row
    expandableContent={<EventVolunteerRowEditor item={ev} addedVolunteers={addedVolunteers} readOnly={readOnly} />}
    isOpen={showEditor}
  >
    {children}
    <div className="flex gap-1 items-center">
      {!readOnly && <DeleteEventVolunteerButton minimal eventVolunteer={ev} />}
      <Button
        requireRight="eventVolunteers:modify"
        entityId={ev._id}
        minimal
        icon={readOnly ? undefined : <Edit />}
        aria-label={useTranslation('common.edit')}
        tooltip={useTranslation('common.edit')}
        color="primary"
        onClick={() => setShowEditor(!showEditor)}
        rightIcon={showEditor ? <ChevronUp /> : <ChevronDown />}
      />
    </div>
  </ItemList.Row>
}

function EventVolunteerRowEditor({ item, addedVolunteers, readOnly }: {
  item: EventVolunteer
  addedVolunteers: VolunteerListItem[]
  readOnly?: boolean
}) {
  const [patchEventVolunteer] = usePatchEventVolunteer()

  const { formProps, state } = useAutosavingState<EventVolunteerFormValues, Partial<EventVolunteerFormValues>>(
    item,
    async (data) => {
      await patchEventVolunteer({
        id: item._id,
        eventVolunteer: {
          wishes: data.wishes,
          notes: data.notes,
          volunteerId: data.volunteer?._id,
          interestedIn: data.interestedIn?.map(r => r._id),
        },
      })
    },
    patchStrategy.partial,
  )

  return <EventVolunteerForm
    {...formProps}
    readOnly={readOnly}
    syncState={state}
    excludeVolunteers={addedVolunteers}
    className="px-4"
    assignmentsEditor={
      <VolunteerAssignmentEditor
        title={useTranslation('domain.eventVolunteer.assignments')}
        id={`volunteerAssignmentEditor-${item._id}`}
        event={{ _id: item.eventId, _versionId: item._versionId, eventRegistrationSystem: 'Kompassi' }}
        volunteerId={item.volunteer._id}
      />
    }
  />
}
