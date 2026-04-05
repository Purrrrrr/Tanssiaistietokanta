import { Volunteer } from 'types'

import { formFor, type FormProps, SubmitButton, type SyncState, SyncStatus } from 'libraries/forms'
import { useT } from 'i18n'

export type VolunteerFormValues = Pick<Volunteer, 'name'>

export const emptyVolunteerForm: VolunteerFormValues = {
  name: '',
}

const {
  Form,
  Input,
} = formFor<VolunteerFormValues>()

interface VolunteerFormProps extends FormProps<VolunteerFormValues> {
  syncState?: SyncState
  submitText?: string
}

export function VolunteerForm({ syncState, onSubmit, submitText, ...rest }: VolunteerFormProps) {
  const t = useT('domain.volunteer')

  return <Form {...rest} onSubmit={onSubmit} errorDisplay={onSubmit ? 'onSubmit' : 'always'}>
    {syncState && <SyncStatus floatRight state={syncState} />}
    <div className="grid grid-cols-2 gap-x-4">
      <Input
        path="name"
        label={t('name')}
        required
      />
    </div>
    { onSubmit && <SubmitButton text={submitText} />}
  </Form>
}
