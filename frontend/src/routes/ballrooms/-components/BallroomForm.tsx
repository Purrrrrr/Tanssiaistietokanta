import { FabricEditor } from 'libraries/fabric/FabricEditor'
import { formFor, FormProps, SubmitButton, SyncState, SyncStatus } from 'libraries/forms'
import { useT } from 'i18n'

import { BallroomFormValues } from './ballroomFormValues'

const {
  Form,
  Input,
  Field,
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
    </div>
    <Field path="map" label={t('map')} component={FabricEditor} />
    {onSubmit && <SubmitButton text={submitText} />}
  </Form>
}
