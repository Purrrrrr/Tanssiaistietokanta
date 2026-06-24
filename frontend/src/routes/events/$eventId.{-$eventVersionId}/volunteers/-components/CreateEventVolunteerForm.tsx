import { useState } from 'react'

import { Event, EventVolunteer } from 'types'

import { addGlobalLoadingAnimation } from 'backend'
import { useCreateEventVolunteer } from 'services/eventVolunteers'

import { Card, DialogCloseButton, H2 } from 'libraries/ui'
import { useT, useTranslation } from 'i18n'

import { emptyEventVolunteerForm, EventVolunteerForm, EventVolunteerFormValues } from './EventVolunteerForm'

interface CreateEventVolunteerFormProps {
  event: Pick<Event, '_id' | '_versionId' | 'eventRegistrationSystem' | 'workshops'>
  eventVolunteers: EventVolunteer[]
  onClose: () => void
}

export function CreateEventVolunteerForm({ event, eventVolunteers, onClose }: CreateEventVolunteerFormProps) {
  const [formData, setFormData] = useState<EventVolunteerFormValues>(emptyEventVolunteerForm)
  const [createEventVolunteer] = useCreateEventVolunteer({ refetchQueries: ['getEventVolunteers'] })
  const t = useT('routes.events.event.volunteers')
  const addedVolunteers = eventVolunteers.map(ev => ev.volunteer)

  const handleSubmit = async (data: EventVolunteerFormValues) => {
    if (!data.volunteer) return
    await addGlobalLoadingAnimation(createEventVolunteer({
      eventVolunteer: {
        eventId: event._id,
        status: data.status,
        volunteerId: data.volunteer._id,
        interestedIn: data.interestedIn.map(r => r._id),
        acceptedRoles: data.acceptedRoles?.map(r => r._id) ?? [],
        wishes: data.wishes,
        notes: data.notes,
      },
    }))
    setFormData(data => ({ ...data, volunteer: undefined }))
  }

  return <Card className="relative">
    <H2>{t('addVolunteer')}</H2>
    <DialogCloseButton
      className="absolute top-3 right-3"
      aria-label={useTranslation('common.close')}
      onClick={() => { setFormData(emptyEventVolunteerForm()); onClose() }}
    />
    <EventVolunteerForm
      value={formData}
      onChange={setFormData}
      onSubmit={handleSubmit}
      submitText={t('addVolunteer')}
      excludeVolunteers={addedVolunteers}
      event={event}
    />
  </Card>
}
