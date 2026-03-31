import { NewValue } from 'libraries/forms/types'

import { formFor, SubmitButton, SyncState, SyncStatus } from 'libraries/forms'
import { TextArea } from 'libraries/forms/fieldComponents/basicComponents'
import { useT } from 'i18n'

import { EventRoleSelector } from './EventRoleSelector'
import { VolunteerChooser } from './VolunteerChooser'

export interface VolunteerItem { _id: string, name: string }

export interface EventRoleItem { _id: string, name: string, description: string, appliesToWorkshops: boolean, order: number }

export interface EventVolunteerFormData {
  volunteer: VolunteerItem | null
  interestedIn: EventRoleItem[]
  wishes: string
  notes: string
}

export const emptyEventVolunteerForm = (): EventVolunteerFormData => ({
  volunteer: null,
  interestedIn: [],
  wishes: '',
  notes: '',
})

const {
  Form,
  Field,
} = formFor<EventVolunteerFormData>()

interface EventVolunteerFormProps {
  value: EventVolunteerFormData
  onChange: (v: NewValue<EventVolunteerFormData>) => void
  onSubmit: (v: EventVolunteerFormData) => unknown | Promise<unknown>
  syncState?: SyncState
}

export function EventVolunteerForm({ value, onChange, onSubmit, syncState }: EventVolunteerFormProps) {
  const tDomain = useT('domain.eventVolunteer')
  const t = useT('pages.events.volunteersPage')

  return <Form value={value} onChange={onChange} onSubmit={onSubmit} labelStyle="above" errorDisplay="onSubmit">
    {syncState && <SyncStatus state={syncState} />}
    <div className="flex flex-wrap gap-4">
      <Field
        path="volunteer"
        label={tDomain('volunteer')}
        component={VolunteerChooser}
        required
        containerClassName="w-60"
      />
      <Field
        path="interestedIn"
        label={tDomain('interestedIn')}
        component={EventRoleSelector}
      />
      <Field path="wishes" label={tDomain('wishes')} component={TextArea} containerClassName="w-60" />
      <Field path="notes" label={tDomain('notes')} component={TextArea} containerClassName="w-60" />
    </div>
    <SubmitButton text={t('form.submit')} />
  </Form>
}
