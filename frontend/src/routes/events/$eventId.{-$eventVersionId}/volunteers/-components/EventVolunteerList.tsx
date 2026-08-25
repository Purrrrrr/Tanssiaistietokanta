import { EventRole, EventVolunteer, VolunteerListItem } from 'types'

import { usePatchEventVolunteer } from 'services/eventVolunteers'

import { useMultipleSelection } from 'libraries/common/selection/useMultipleSelection'
import { patchStrategy, useAutosavingState } from 'libraries/forms'
import { FormGroup, ItemList } from 'libraries/ui'
import { Edit, Pin, Search } from 'libraries/ui/icons'
import { RoleTag } from 'components/eventVolunteers/RoleTag'
import { VolunteerStatusSelector } from 'components/eventVolunteers/VolunteerStatusSelector'
import { useT, useTranslation } from 'i18n'
import { sortedBy } from 'utils/sorted'

import { useCurrentEvent } from '../../-context'
import { DeleteEventVolunteerButton } from './DeleteEventVolunteerButton'
import { EventVolunteerForm, EventVolunteerFormValues } from './EventVolunteerForm'

export interface EventVolunteerListProps {
  eventVolunteers: EventVolunteer[]
  readOnly?: boolean
  currentRole?: string
  onSetRole: (roleId: string | undefined) => void
}

export function EventVolunteerList({ eventVolunteers, readOnly, currentRole, onSetRole }: EventVolunteerListProps) {
  const t = useT('routes.events.event.volunteers')
  const editStr = useTranslation('common.edit')
  const label = useT('domain.eventVolunteer')

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
            <VolunteerStatusSelector id="statusBulkSelector" eventVolunteers={selected} />
          </FormGroup>
        }
      </div>
    </div>
    <ItemList
      items={eventVolunteers}
      emptyText={t('noVolunteers')}
      selection={selector}
      defaultSort="taskRoles"
      alwaysSortBy={ev => ev.volunteer.name}
      expandableContent={ev => <EventVolunteerRowEditor item={ev} addedVolunteers={addedVolunteers} readOnly={readOnly} />}
      expandButtonProps={ev => ({
        requireRight: 'eventVolunteers:modify',
        entityId: ev._id,
        icon: readOnly ? undefined : <Edit />,
        ariaLabel: editStr,
        tooltip: editStr,
        color: 'primary',
      })}
      labelTranslator={label}
      columns={[
        {
          key: 'name',
          sortableContent: 'volunteer.name',
        }, {
          key: 'status',
          content: ev => <VolunteerStatusSelector id={`status-${ev._id}`} eventVolunteers={[ev]} iconOnly />,
          width: 'max-content',
        }, {
          key: 'taskRoles',
          labelInfo: <span aria-hidden>(<AssignedRoleIcon /> = {label('assigned')} / <InterestedRoleIcon /> = {label('interested')})</span>,
          content: ev => <>
            {(getTasksRoles(ev)).map(role => (
              <RoleTag
                key={role._id}
                icon={role.assigned ? <AssignedRoleIcon label={label('assigned')} /> : <InterestedRoleIcon label={label('interested')} />}
                role={role}
                selected={currentRole ? currentRole === role._id : undefined}
                onSetRole={onSetRole}
              />
            ))}
          </>,
          sortBy: ev => getTasksRoles(ev).map(role => [role.order, role.assigned]),
        }, {
          key: 'wishes',
          content: ev => ev.wishes ? ev.wishes : <span className="italic text-muted">{label('noWishes')}</span>,
        }, {
          key: 'notes',
          content: ev => ev.notes ?? '-',
          width: '1fr',
        },
      ]}
      actions={ev => !readOnly && <DeleteEventVolunteerButton minimal eventVolunteer={ev} />}
    />
  </>
}

const AssignedRoleIcon = ({ label }: { label?: string }) => <Pin title={label} aria-label={label} className="align-text-top" size={14} />
const InterestedRoleIcon = ({ label }: { label?: string }) => <Search title={label} aria-label={label} className="align-text-top" size={12} />

interface TaskRole extends Pick<EventRole, '_id' | 'name' | 'order'> {
  assigned: boolean
}

function getTasksRoles(ev: EventVolunteer): TaskRole[] {
  const assignmentsByRole = Map.groupBy(ev.assignments, ev => ev.role._id)
  const assignmentRoles = assignmentsByRole
    .values()
    .map(assignments => ({
      ...assignments[0].role,
      assigned: true,
    }))
  const interestedInRoles = ev.interestedIn
    .filter(role => !assignmentsByRole.has(role._id))
    .map(role => ({
      ...role,
      assigned: false,
    }))

  return sortedBy([...assignmentRoles, ...interestedInRoles], 'order')
}

function EventVolunteerRowEditor({ item, addedVolunteers, readOnly }: {
  item: EventVolunteer
  addedVolunteers: VolunteerListItem[]
  readOnly?: boolean
}) {
  const [patchEventVolunteer] = usePatchEventVolunteer()
  const event = useCurrentEvent()

  const { formProps, state } = useAutosavingState<EventVolunteerFormValues, Partial<EventVolunteerFormValues>>(
    item,
    async (data) => {
      await patchEventVolunteer({
        id: item._id,
        eventVolunteer: {
          status: data.status,
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
    volunteerId={item.volunteer._id}
    event={event}
    excludeVolunteers={addedVolunteers}
    className="px-4"
  />
}
