import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { addGlobalLoadingAnimation } from 'backend'
import { useCreateEventVolunteer, useEventVolunteers, usePatchEventVolunteer } from 'services/eventVolunteers'

import { patchStrategy, useAutosavingState } from 'libraries/forms'
import { Button, Card, H2 } from 'libraries/ui'
import { ChevronDown, ChevronUp, Edit } from 'libraries/ui/icons'
import { ItemList } from 'libraries/ui/ItemList'
import { DeleteEventVolunteerButton } from 'components/eventVolunteers/DeleteEventVolunteerButton'
import { emptyEventVolunteerForm, EventRoleItem, EventVolunteerForm, EventVolunteerFormData, VolunteerItem } from 'components/eventVolunteers/EventVolunteerForm'
import { useT, useTranslation } from 'i18n'

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
  const [eventVolunteers] = useEventVolunteers({ eventId: event._id })

  return <>
    <H2>{t('title')}</H2>
    <ItemList
      items={eventVolunteers ?? []}
      emptyText={t('noVolunteers')}
      columns="grid-cols-[1fr_1fr_1fr_1fr_max-content]"
    >
      <ItemList.Header>
        <span>{t('columns.name')}</span>
        <span>{t('columns.interestedIn')}</span>
        <span>{t('columns.wishes')}</span>
        <span>{t('columns.notes')}</span>
        <span />
      </ItemList.Header>
      {(eventVolunteers ?? []).map(ev =>
        <EventVolunteerListRow key={ev._id} ev={ev as EventVolunteerItem} />,
      )}
    </ItemList>
    <CreateEventVolunteerForm eventId={event._id} />
  </>
}

function EventVolunteerListRow({ ev }: { ev: EventVolunteerItem }) {
  const [showEditor, setShowEditor] = useState(false)

  return <ItemList.Row
    expandableContent={<EventVolunteerRowEditor item={ev} />}
    isOpen={showEditor}
  >
    <span>{ev.volunteer.name}</span>
    <span>{ev.interestedIn.map(role => role.name).join(', ')}</span>
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

  return <EventVolunteerForm {...formProps} syncState={state} />
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
