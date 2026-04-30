import { EventRegistrationSystem } from 'types/events'

import { FieldComponentProps, RadioGroup } from 'libraries/forms'
import { useT } from 'i18n'

export function EventRegistrationSystemSelector(props: FieldComponentProps<EventRegistrationSystem>) {
  const t = useT('domain.EventRegistrationSystem')
  return (
    <RadioGroup<EventRegistrationSystem>
      options={[
        { value: 'None', label: t('None') },
        { value: 'Kompassi', label: t('Kompassi') },
      ]}
      {...props}
    />
  )
}
