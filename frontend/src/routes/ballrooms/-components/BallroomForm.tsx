import { formFor, FormProps, SubmitButton, SyncState, SyncStatus } from 'libraries/forms'
import { useT } from 'i18n'

import { BallroomFormValues } from './ballroomFormValues'

const {
  Form,
  Input,
} = formFor<BallroomFormValues>()

interface BallroomFormProps extends FormProps<BallroomFormValues> {
  syncState?: SyncState
  submitText?: string
}

export function BallroomForm({ syncState, onSubmit, submitText, ...rest }: BallroomFormProps) {
  const t = useT('domain.ballroom')

  return <Form {...rest} onSubmit={onSubmit} errorDisplay={onSubmit ? 'onSubmit' : 'always'}>
    {syncState && <SyncStatus floatRight state={syncState} />}
    <div className="flex gap-x-4 items-center">
      <Input
        containerClassName="grow"
        path="venueName"
        label={t('venueName')}
        required
      />
      <Input
        containerClassName="grow"
        path="roomName"
        label={t('roomName')}
      />
      {onSubmit &&
        <div>
          <SubmitButton text={submitText} />
        </div>
      }
    </div>
  </Form>
}
