import { Event, EventRole, EventVolunteerInput, VolunteerListItem } from 'types'

import { formFor, type FormProps, SubmitButton, type SyncState, SyncStatus } from 'libraries/forms'
import { TextArea } from 'libraries/forms/fieldComponents/basicComponents'
import { VolunteerRoleAssignmentEditor } from 'components/eventVolunteerAssignments/VolunteerRoleAssignmentEditor'
import { VolunteerStatusRadioGroup } from 'components/eventVolunteers/VolunteerStatusRadioGroup'
import { VolunteerChooser } from 'components/volunteers/VolunteerChooser'
import { useT } from 'i18n'

import { EventVolunteerRolePicker } from './EventVolunteerRolePicker'

export type EventVolunteerFormValues = Omit<EventVolunteerInput, 'volunteerId' | 'eventId' | 'interestedIn' | 'acceptedRoles'> & {
  volunteer?: VolunteerListItem
  interestedIn: Pick<EventRole, '_id'>[]
  acceptedRoles?: Pick<EventRole, '_id'>[]
}

export const emptyEventVolunteerForm = (): EventVolunteerFormValues => ({
  volunteer: undefined,
  status: 'Interested',
  interestedIn: [],
  acceptedRoles: [],
  wishes: '',
  notes: '',
})

const {
  Form,
  Field,
  useValueAt,
} = formFor<EventVolunteerFormValues>()

interface EventVolunteerFormProps extends FormProps<EventVolunteerFormValues> {
  syncState?: SyncState
  excludeVolunteers?: VolunteerListItem[]
  volunteerId?: string
  event: Pick<Event, '_id' | '_versionId' | 'eventRegistrationSystem' | 'workshops'>
  submitText?: string
}

export function EventVolunteerForm({ syncState, onSubmit, excludeVolunteers = [], event, volunteerId, submitText, ...rest }: EventVolunteerFormProps) {
  const t = useT('domain.eventVolunteer')
  const isNew = volunteerId === undefined

  return <Form {...rest} onSubmit={onSubmit} errorDisplay={onSubmit ? 'onSubmit' : 'always'}>
    {syncState && <SyncStatus floatRight state={syncState} />}
    <div className="grid grid-cols-2 gap-x-4">
      <Field
        path="volunteer"
        label={t('volunteer')}
        component={VolunteerChooser}
        componentProps={{
          excludeVolunteers: isNew
            ? excludeVolunteers
            : excludeVolunteers.filter(v => v._id !== rest.value.volunteer?._id),
        }}
        required
      />
      <Field
        path="status"
        label={t('status')}
        component={VolunteerStatusRadioGroup}
        containerClassName="col-span-full"
      />
      <Field
        path="interestedIn"
        label={t('interestedIn')}
        component={EventVolunteerRolePicker}
        containerClassName="col-span-full"
      />
      {isNew
        ? <AcceptedRolesField label={t('assignments')} />
        : (
          <div className="col-span-full">
            <VolunteerRoleAssignmentEditor
              title={t('assignments')}
              id={`volunteerAssignmentEditor-${volunteerId}`}
              event={event}
              volunteerId={volunteerId}
            />
          </div>
        )
      }
      <Field path="wishes" label={t('wishes')} component={TextArea} />
      <Field path="notes" label={t('notes')} component={TextArea} />
    </div>
    { onSubmit && <SubmitButton text={submitText} />}
  </Form>
}

function AcceptedRolesField({ label }: { label: string }) {
  const status = useValueAt('status')

  if (status !== 'Accepted') return null

  return <Field
    path="acceptedRoles"
    label={label}
    component={EventVolunteerRolePicker}
    componentProps={{ noWorkshopRoles: true }}
    containerClassName="col-span-full"
  />
}
