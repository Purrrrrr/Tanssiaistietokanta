import { useState } from 'react'

import { EventVolunteer, VolunteerListItem } from 'types'

import { usePatchEventVolunteer } from 'services/eventVolunteers'

import { patchStrategy, useAutosavingState } from 'libraries/forms'
import { Button, FormGroup } from 'libraries/ui'
import { ChevronDown, ChevronUp, Edit } from 'libraries/ui/icons'
import { ItemList, Sort } from 'libraries/ui/ItemList'
import { RoleTag } from 'components/eventVolunteers/RoleTag'
import { VolunteerStatusBulkSelector } from 'components/eventVolunteers/VolunteerStatusBulkSelector'
import { SelectionBox } from 'components/widgets/SelectionBox'
import { useT, useTranslation } from 'i18n'
import { sortedBy } from 'utils/sorted'
import { useMultipleSelection } from 'utils/useMultipleSelection'

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
  const [sort, setSort] = useState<Sort>({ key: 'interestedIn', direction: 'asc' })

  const eventVolunteers = sortedBy(unsorted ?? [], volunteerSorter(sort.key), sort.direction === 'desc')
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
      columns="grid-cols-[auto_max-content_auto_auto_1fr_1fr_max-content]"
    >
      <ItemList.SortableHeader currentSort={sort} onSort={setSort} columns={[
        { key: 'select', sortable: false, label: <SelectionBox {...selector.selectAllProps} /> },
        { key: 'name', label: label('name') },
        { key: 'status', label: label('status') },
        { key: 'interestedIn', label: label('interestedIn') },
        { key: 'wishes', label: label('wishes') },
        { key: 'notes', label: label('notes') },
      ]} />
      {(eventVolunteers).map(ev =>
        <EventVolunteerListRow
          key={ev._id}
          eventVolunteer={ev}
          addedVolunteers={addedVolunteers}
          readOnly={readOnly}
        >
          <SelectionBox {...selector.selectItemProps(ev)} />
          <span>{ev.volunteer.name}</span>
          <span>{label(`shortEventVolunteerStatus.${ev.status}`)}</span>
          <span>
            {sortedBy(ev.interestedIn, item => item.order)
              .map(role =>
                <RoleTag
                  key={role._id}
                  role={role}
                  selected={currentRole ? currentRole === role._id : undefined}
                  onSetRole={onSetRole}
                />,
              )}
            {ev.interestedIn.length === 0 &&
              <span className="italic text-gray-500">{label('noInterests')}</span>
            }
          </span>
          <span>{ev.wishes ? ev.wishes : <span className="italic text-gray-500">{label('noWishes')}</span>}</span>
          <span>{ev.notes || '-'}</span>
        </EventVolunteerListRow>,
      )}
    </ItemList>
  </>
}

function volunteerSorter(key: string) {
  switch (key) {
    default:
    case 'status':
      return (ev: EventVolunteer) => ev.status
    case 'name':
      return (ev: EventVolunteer) => ev.volunteer.name
    case 'interestedIn':
      return (ev: EventVolunteer) => ev.interestedIn.map(role => role.order * 100 - ev.interestedIn.length).map(nr => String(nr).padStart(5, '0')).join('.')
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
      {!readOnly && <DeleteEventVolunteerButton minimal eventVolunteerId={ev._id} />}
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
          acceptedRoles: data.interestedIn?.map(r => r._id),
        },
      })
    },
    patchStrategy.partial,
  )

  return <EventVolunteerForm {...formProps} readOnly={readOnly} syncState={state} excludeVolunteers={addedVolunteers} className="px-4" />
}
