import { formFor, SubmitButton, SyncState, SyncStatus } from 'libraries/forms'
import { TextArea } from 'libraries/forms/fieldComponents/basicComponents'
import { FormProps } from 'libraries/forms/Form'
import { useT } from 'i18n'

import { EventRoleSelector } from './EventRoleSelector'
import { VolunteerChooser } from './VolunteerChooser'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type VolunteerItem = { _id: string, name: string }

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type EventRoleItem = { _id: string, name: string, description: string, appliesToWorkshops: boolean, order: number }

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type EventVolunteerFormData = {
  volunteer: VolunteerItem | null
  interestedIn: EventRoleItem[]
  wishes: string | null
  notes: string | null
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

interface EventVolunteerFormProps extends FormProps<EventVolunteerFormData> {
  syncState?: SyncState
}

export function EventVolunteerForm({ value, onChange, onSubmit, syncState, onValidityChange, onResolveConflict, conflicts }: EventVolunteerFormProps) {
  const tDomain = useT('domain.eventVolunteer')
  const t = useT('pages.events.volunteersPage')

  return <Form value={value} onChange={onChange} onSubmit={onSubmit} onValidityChange={onValidityChange} onResolveConflict={onResolveConflict} conflicts={conflicts} labelStyle="above" errorDisplay="onSubmit">
    {syncState && <SyncStatus floatRight state={syncState} />}
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
    { onSubmit && <SubmitButton text={t('form.submit')} />}
  </Form>
}
