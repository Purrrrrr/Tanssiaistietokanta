import { EditableFormationDiagram } from 'types/formationDiagrams'

import { FabricEditor } from 'libraries/fabric/FabricEditor'
import { formFor, FormProps, SubmitButton, SyncState, SyncStatus } from 'libraries/forms'
import { BallroomSelect } from 'components/ballroom/BallroomSelect'
import { useT } from 'i18n'

const {
  Form,
  Field,
  Input,
} = formFor<EditableFormationDiagram>()

export function FormationDiagramForm({ value, syncStatus, submitText, ...rest }: FormProps<EditableFormationDiagram> & {
  syncStatus?: SyncState
  submitText?: string
}) {
  const label = useT('domain.formationDiagram')

  return <Form value={value} {...rest} errorDisplay="onSubmit">
    {syncStatus && <SyncStatus className="mt-2" floatRight state={syncStatus} />}
    <Input label={label('description')} path="description" required />
    <Field label={label('ballroom')} path="ballroom" component={BallroomSelect} required />
    <Field
      label={label('diagram')}
      path="diagram"
      component={FabricEditor}
      componentProps={{ baseDiagram: value.ballroom?.map ?? undefined }}
    />
    {rest.onSubmit && <SubmitButton text={submitText} />}
  </Form>
}
