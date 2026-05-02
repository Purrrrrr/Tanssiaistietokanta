import { WorkshopRegistrationStatus } from 'types'

import { FieldComponentProps, RadioGroup } from 'libraries/forms'
import { useT } from 'i18n'

export function WorkshopRegistrationStatusSelector(props: FieldComponentProps<WorkshopRegistrationStatus>) {
  const t = useT('components.workshopEditor.WorkshopRegistrationStatus')
  return (
    <RadioGroup<WorkshopRegistrationStatus>
      options={['None', 'RegisteredToEventSystem', 'InformedToOrganizers']}
      optionToString={t}
      {...props}
    />
  )
}
