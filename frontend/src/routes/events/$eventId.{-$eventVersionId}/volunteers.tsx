import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { EventRole, EventVolunteer, Volunteer } from 'types'

import { addGlobalLoadingAnimation } from 'backend'
import { useCreateEventVolunteer, useEventVolunteers, usePatchEventVolunteer } from 'services/eventVolunteers'

import { patchStrategy, useAutosavingState } from 'libraries/forms'
import { Button, Card, H2 } from 'libraries/ui'
import { ChevronDown, ChevronUp, Edit } from 'libraries/ui/icons'
import { ItemList, Sort } from 'libraries/ui/ItemList'
import { titleCase } from 'libraries/ui-showcase/utils/titleCase'
import { DeleteEventVolunteerButton } from 'components/eventVolunteers/DeleteEventVolunteerButton'
import { emptyEventVolunteerForm, EventVolunteerForm, EventVolunteerFormValues } from 'components/eventVolunteers/EventVolunteerForm'
import { ColoredTag, ColoredTagProps } from 'components/widgets/ColoredTag'
import { useT, useTranslation } from 'i18n'
import { sortedBy } from 'utils/sorted'

import { useCurrentEvent } from './-context'

export const Route = createFileRoute(
  '/events/$eventId/{-$eventVersionId}/volunteers',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const event = useCurrentEvent()
  const t = useT('pages.events.volunteersPage')
  const [unsortedEventVolunteers] = useEventVolunteers({ eventId: event._id })
  const [sort, setSort] = useState<Sort>({ key: 'interestedIn', direction: 'asc' })
  const eventVolunteers = sortedBy(unsortedEventVolunteers ?? [], volunteerSorter(sort.key), sort.direction === 'desc')
  const addedVolunteers = unsortedEventVolunteers.map(ev => ev.volunteer)

  return <>
    <H2>{t('title')}</H2>
    {eventVolunteers?.length > 0 &&
      <p>{t('Nvolunteers', { count: eventVolunteers?.length })}</p>
    }
    <EventVolunteerRoleCounts volunteers={unsortedEventVolunteers ?? []} />
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
        <EventVolunteerListRow key={ev._id} ev={ev as EventVolunteer} addedVolunteers={addedVolunteers} />,
      )}
    </ItemList>
    <CreateEventVolunteerForm eventId={event._id} addedVolunteers={addedVolunteers} />
  </>
}

function volunteerSorter(key: string) {
  switch (key) {
    default:
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

  return <div className="flex gap-1 flex-wrap my-2">
    {roles.map(([role, count]) => (
      <RoleTag key={role._id} role={role} tag={count} title={count === 1 ? role.name : titleCase(role.plural)} />
    ))}
  </div>
}

function RoleTag({ role, title, ...props }: { role: EventRole, title?: string } & Omit<ColoredTagProps, 'hashSource' | 'title'>) {
  return <ColoredTag hashSource={role.order * 2 - 1} title={title ?? role.name} {...props} />
}

function EventVolunteerListRow({ ev, addedVolunteers }: { ev: EventVolunteer, addedVolunteers: Volunteer[] }) {
  const [showEditor, setShowEditor] = useState(false)
  const t = useT('')

  return <ItemList.Row
    expandableContent={<EventVolunteerRowEditor item={ev} addedVolunteers={addedVolunteers} />}
    isOpen={showEditor}
  >
    <span>{ev.volunteer.name}</span>
    <span>
      {sortedBy(ev.interestedIn, item => item.order).map(role => <RoleTag key={role._id} role={role} />)}
      {ev.interestedIn.length === 0 &&
        <span className="italic text-gray-500">{t('domain.eventVolunteer.noInterests')}</span>
      }
    </span>
    <span>{ev.wishes ? ev.wishes : <span className="italic text-gray-500">{t('domain.eventVolunteer.noWishes')}</span>}</span>
    <span>{ev.notes || '-'}</span>
    <div className="flex items-center gap-1">
      <DeleteEventVolunteerButton minimal eventVolunteerId={ev._id} />
      <Button
        requireRight="eventVolunteers:modify"
        entityId={ev._id}
        minimal
        icon={<Edit />}
        aria-label={t('common.edit')}
        tooltip={t('common.edit')}
        color="primary"
        onClick={() => setShowEditor(!showEditor)}
        rightIcon={showEditor ? <ChevronUp /> : <ChevronDown />}
      />
    </div>
  </ItemList.Row>
}

function EventVolunteerRowEditor({ item, addedVolunteers }: { item: EventVolunteer, addedVolunteers: Volunteer[] }) {
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

  return <EventVolunteerForm {...formProps} syncState={state} excludeVolunteers={addedVolunteers} className="px-4" />
}

function CreateEventVolunteerForm({ eventId, addedVolunteers }: { eventId: string, addedVolunteers: Volunteer[] }) {
  const [formData, setFormData] = useState<EventVolunteerFormValues>(emptyEventVolunteerForm)
  const [createEventVolunteer] = useCreateEventVolunteer({ refetchQueries: ['getEventVolunteers'] })

  const handleSubmit = async (data: EventVolunteerFormValues) => {
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
    <EventVolunteerForm value={formData} onChange={setFormData} onSubmit={handleSubmit} excludeVolunteers={addedVolunteers} isNew />
  </Card>
}
