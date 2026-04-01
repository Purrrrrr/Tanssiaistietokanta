import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { addGlobalLoadingAnimation } from 'backend'
import { useCreateEventVolunteer, useEventVolunteers, usePatchEventVolunteer } from 'services/eventVolunteers'

import { patchStrategy, useAutosavingState } from 'libraries/forms'
import { Button, Card, H2 } from 'libraries/ui'
import { ChevronDown, ChevronUp, Edit } from 'libraries/ui/icons'
import { ItemList, Sort } from 'libraries/ui/ItemList'
import { DeleteEventVolunteerButton } from 'components/eventVolunteers/DeleteEventVolunteerButton'
import { emptyEventVolunteerForm, EventRoleItem, EventVolunteerForm, EventVolunteerFormData, VolunteerItem } from 'components/eventVolunteers/EventVolunteerForm'
import { useT, useTranslation } from 'i18n'
import { sortedBy } from 'utils/sorted'

import { useCurrentEvent } from './-context'

export const Route = createFileRoute(
  '/events/$eventId/{-$eventVersionId}/volunteers',
)({
  component: RouteComponent,
})

interface EventVolunteerItem {
  _id: string
  eventId: string
  volunteerId: string
  volunteer: VolunteerItem
  interestedIn: EventRoleItem[]
  wishes: string | null
  notes: string | null
}

function RouteComponent() {
  const event = useCurrentEvent()
  const t = useT('pages.events.volunteersPage')
  const [unsortedEventVolunteers] = useEventVolunteers({ eventId: event._id })
  const [sort, setSort] = useState<Sort>({ key: 'interestedIn', direction: 'asc' })
  const eventVolunteers = sortedBy(unsortedEventVolunteers ?? [], volunteerSorter(sort.key), sort.direction === 'desc')

  return <>
    <H2>{t('title')}</H2>
    {eventVolunteers?.length > 0 &&
      <p>
        {t('Nvolunteers', { count: eventVolunteers?.length })}:{' '}
        <EventVolunteerRoleCounts volunteers={unsortedEventVolunteers ?? []} />
      </p>
    }
    <ItemList
      items={eventVolunteers ?? []}
      emptyText={t('noVolunteers')}
      columns="grid-cols-[1fr_1fr_1fr_1fr_max-content]"
    >
      <ItemList.SortableHeader currentSort={sort} onSort={setSort} columns={[
        { key: 'name', label: t('columns.name') },
        { key: 'interestedIn', label: t('columns.interestedIn') },
        { key: 'wishes', label: t('columns.wishes') },
        { key: 'notes', label: t('columns.notes') },
      ]} />
      {(eventVolunteers ?? []).map(ev =>
        <EventVolunteerListRow key={ev._id} ev={ev as EventVolunteerItem} />,
      )}
    </ItemList>
    <CreateEventVolunteerForm eventId={event._id} />
  </>
}

function volunteerSorter(key: string) {
  switch (key) {
    default:
    case 'name':
      return (ev: EventVolunteerItem) => ev.volunteer.name
    case 'interestedIn':
      return (ev: EventVolunteerItem) => ev.interestedIn.map(role => role.order * 100 - ev.interestedIn.length).map(nr => String(nr).padStart(5, '0')).join('.')
    case 'wishes':
      return (ev: EventVolunteerItem) => ev.wishes ?? ''
    case 'notes':
      return (ev: EventVolunteerItem) => ev.notes ?? ''
  }
}

function EventVolunteerRoleCounts({ volunteers }: { volunteers: EventVolunteer[] }) {
  const roleCounts = new Map<EventRole, number>()
  volunteers.forEach(ev => {
    ev.interestedIn.forEach(role => {
      roleCounts.set(role, (roleCounts.get(role) ?? 0) + 1)
    })
  })

  const roles = sortedBy(
    Array.from(roleCounts.entries()),
    ([role]) => role.order,
  )

  return <span className="comma-separated-list">
    {roles.map(([role, count]) => (
      <div key={role._id}>{count} {count === 1 ? role.name.toLowerCase() : role.plural}</div>
    ))}
  </span>
}

function EventVolunteerListRow({ ev }: { ev: EventVolunteerItem }) {
  const [showEditor, setShowEditor] = useState(false)

  return <ItemList.Row
    expandableContent={<EventVolunteerRowEditor item={ev} />}
    isOpen={showEditor}
  >
    <span>{ev.volunteer.name}</span>
    <span>{sortedBy(ev.interestedIn, item => item.order).map(role => role.name).join(', ')}</span>
    <span>{ev.wishes}</span>
    <span>{ev.notes}</span>
    <div className="flex items-center gap-1">
      <DeleteEventVolunteerButton minimal eventVolunteerId={ev._id} />
      <Button
        requireRight="eventVolunteers:modify"
        entityId={ev._id}
        minimal
        icon={<Edit />}
        aria-label={useTranslation('common.edit')}
        tooltip={useTranslation('common.edit')}
        color="primary"
        onClick={() => setShowEditor(!showEditor)}
        rightIcon={showEditor ? <ChevronUp /> : <ChevronDown />}
      />
    </div>
  </ItemList.Row>
}

function EventVolunteerRowEditor({ item }: { item: EventVolunteerItem }) {
  const [patchEventVolunteer] = usePatchEventVolunteer()

  const { formProps, state } = useAutosavingState<EventVolunteerFormData, Partial<EventVolunteerFormData>>(
    item,
    async (data) => {
      await patchEventVolunteer({
        id: item._id,
        eventVolunteer: {
          ...data,
          volunteerId: data.volunteer?._id,
          interestedIn: data.interestedIn?.map(r => r._id),
        },
      })
    },
    patchStrategy.partial,
  )

  return <EventVolunteerForm {...formProps} syncState={state} className="px-4" />
}

function CreateEventVolunteerForm({ eventId }: { eventId: string }) {
  const [formData, setFormData] = useState<EventVolunteerFormData>(emptyEventVolunteerForm)
  const [createEventVolunteer] = useCreateEventVolunteer({ refetchQueries: ['getEventVolunteers'] })

  const handleSubmit = async (data: EventVolunteerFormData) => {
    if (!data.volunteer) return
    await addGlobalLoadingAnimation(createEventVolunteer({
      eventVolunteer: {
        eventId,
        volunteerId: data.volunteer._id,
        interestedIn: data.interestedIn.map(r => r._id),
        wishes: data.wishes,
        notes: data.notes,
      },
    }))
    setFormData(emptyEventVolunteerForm())
  }

  return <Card>
    <H2>{useTranslation('pages.events.volunteersPage.addVolunteer')}</H2>
    <EventVolunteerForm value={formData} onChange={setFormData} onSubmit={handleSubmit} />
  </Card>
}
