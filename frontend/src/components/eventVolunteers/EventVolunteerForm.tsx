import { NewValue } from 'libraries/forms/types'

import { formFor, SubmitButton, SyncState, SyncStatus } from 'libraries/forms'
import { useT } from 'i18n'

import { VolunteerChooser } from './VolunteerChooser'

export interface VolunteerItem { _id: string, name: string }

export interface EventVolunteerFormData {
  volunteer: VolunteerItem | null
  wishes: string
  notes: string
}

export const emptyEventVolunteerForm = (): EventVolunteerFormData => ({
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
      <Input path="wishes" label={tDomain('wishes')} containerClassName="w-60" />
      <Input path="notes" label={tDomain('notes')} containerClassName="w-60" />
    </div>
    <SubmitButton text={t('form.submit')} />
  </Form>
}
