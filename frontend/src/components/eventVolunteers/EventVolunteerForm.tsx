import { EventRole, EventVolunteerInput, Volunteer } from 'types'

import { formFor, SubmitButton, SyncState, SyncStatus } from 'libraries/forms'
import { TextArea } from 'libraries/forms/fieldComponents/basicComponents'
import { FormProps } from 'libraries/forms/Form'
import { useT } from 'i18n'

import { EventVolunteerRolePicker } from './EventVolunteerRolePicker'
import { VolunteerChooser } from './VolunteerChooser'

export type EventVolunteerFormValues = Omit<EventVolunteerInput, 'volunteerId' | 'eventId' | 'interestedIn'> & {
  volunteer?: Volunteer
  interestedIn: EventRole[]
}

export const emptyEventVolunteerForm = (): EventVolunteerFormValues => ({
  volunteer: undefined,
  interestedIn: [],
  wishes: '',
  notes: '',
})

const {
  Form,
  Field,
} = formFor<EventVolunteerFormValues>()

interface EventVolunteerFormProps extends FormProps<EventVolunteerFormValues> {
  syncState?: SyncState
  excludeVolunteers?: Volunteer[]
  isNew?: boolean
}

export function EventVolunteerForm({ syncState, onSubmit, excludeVolunteers = [], isNew, ...rest }: EventVolunteerFormProps) {
  const tDomain = useT('domain.eventVolunteer')
  const t = useT('pages.events.volunteersPage')

  return <Form {...rest} onSubmit={onSubmit} errorDisplay={onSubmit ? 'onSubmit' : 'always'}>
    {syncState && <SyncStatus floatRight state={syncState} />}
    <div className="grid grid-cols-2 gap-x-4">
      <Field
        path="volunteer"
        label={tDomain('volunteer')}
        component={VolunteerChooser}
        componentProps={{
          excludeVolunteers: isNew ? excludeVolunteers : excludeVolunteers.filter(v => v._id !== rest.value.volunteer?._id),
        }}
        required
      />
      <Field
        path="interestedIn"
        label={tDomain('interestedIn')}
        component={EventVolunteerRolePicker}
        containerClassName="col-span-full"
      />
      <Field path="wishes" label={tDomain('wishes')} component={TextArea} />
      <Field path="notes" label={tDomain('notes')} component={TextArea} />
    </div>
    { onSubmit && <SubmitButton text={t('form.submit')} />}
  </Form>
}
