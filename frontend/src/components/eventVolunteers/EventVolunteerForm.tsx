import { useState } from 'react'

import { useCreateEventVolunteer } from 'services/eventVolunteers'

import { formFor, SubmitButton } from 'libraries/forms'
import { H2 } from 'libraries/ui'
import { useT } from 'i18n'

import { VolunteerChooser } from './VolunteerChooser'

interface VolunteerItem { _id: string, name: string }

interface EventVolunteerFormData {
  volunteer: VolunteerItem | null
  wishes: string
  notes: string
}

const emptyForm = (): EventVolunteerFormData => ({
  volunteer: null,
  wishes: '',
  notes: '',
})

const {
  Form,
  Field,
  Input,
} = formFor<EventVolunteerFormData>()

interface EventVolunteerFormProps {
  eventId: string
}

export function EventVolunteerForm({ eventId }: EventVolunteerFormProps) {
  const t = useT('pages.events.volunteersPage')
  const tDomain = useT('domain.eventVolunteer')
  const [formData, setFormData] = useState<EventVolunteerFormData>(emptyForm)
  const [createEventVolunteer] = useCreateEventVolunteer({ refetchQueries: ['getEventVolunteers'] })

  const handleSubmit = async (data: EventVolunteerFormData) => {
    if (!data.volunteer) return
    await createEventVolunteer({
      eventVolunteer: {
        eventId,
        volunteerId: data.volunteer._id,
        wishes: data.wishes,
        notes: data.notes,
      },
    })
    setFormData(emptyForm())
  }

  return <>
    <H2>{t('addVolunteer')}</H2>
    <Form value={formData} onChange={setFormData} onSubmit={handleSubmit} labelStyle="above" errorDisplay="onSubmit">
      <div className="flex flex-wrap gap-4">
        <Field
          path="volunteer"
          label={tDomain('volunteer')}
          component={VolunteerChooser}
          required
          containerClassName="w-60"
        />
        <Input path="wishes" label={tDomain('wishes')} containerClassName="w-60" />
        <Input path="notes" label={tDomain('notes')} containerClassName="w-60" />
      </div>
      <SubmitButton text={t('form.submit')} />
    </Form>
  </>
}
