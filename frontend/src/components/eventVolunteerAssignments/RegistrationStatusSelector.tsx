import { EventVolunteerRegistrationStatus } from 'types'

import { Select } from 'libraries/formsV2/components/inputs/selectors'
import { Button } from 'libraries/ui'
import { CaretDown } from 'libraries/ui/icons'
import { useT, useTranslation } from 'i18n'

import RegistrationStatusIcon from './RegistrationStatusIcon'
import { registrationStatuses } from './statuses'

const validStatuses: Record<EventVolunteerRegistrationStatus, EventVolunteerRegistrationStatus[]> = {
  None: ['RegisteredToEventSystem', 'AcceptedRegistration', 'InformedToOrganizers', 'RegistrationCancelled'],
  RegisteredToEventSystem: ['None', 'AcceptedRegistration', 'RegistrationCancelled'],
  AcceptedRegistration: ['None', 'RegistrationCancelled'],
  InformedToOrganizers: ['None', 'RegistrationCancelled'],
  RegistrationCancelled: ['None'],
}

export default function RegistrationStatusSelector({ id, className, value, onChange, disabled, showText }: {
  className?: string
  id: string
  showText?: boolean
  value?: EventVolunteerRegistrationStatus | EventVolunteerRegistrationStatus[]
  onChange: (registrationStatus: EventVolunteerRegistrationStatus) => void
  disabled?: boolean
}) {
  const t = useT('domain.EventVolunteerAssignmentRegistrationStatus')
  const choose = useTranslation('components.volunteerAssignmentEditor.chooseStatus')
  const values = Array.isArray(value)
    ? value
    : (value ? [value] : [])
  const commonValue = values.every(v => v === values[0]) ? values[0] : null
  const validOptions = registrationStatuses.filter(status => values.every(v => status === v || validStatuses[v].includes(status)))

  const text = commonValue ? t(commonValue) : undefined
  return <Select<EventVolunteerRegistrationStatus | null>
    id={id}
    containerClassname={className}
    readOnly={disabled}
    value={commonValue ?? null}
    placeholder={choose}
    onChange={status => status && onChange(status)}
    items={validOptions}
    itemIcon={status => <RegistrationStatusIcon status={status} />}
    itemToString={status => status ? t(status) : choose}
    buttonRenderer={(selectedItem, props) =>
      <Button
        minimal
        icon={<RegistrationStatusIcon status={selectedItem} />}
        rightIcon={<CaretDown />}
        text={showText ? (text ?? choose) : undefined}
        tooltip={showText ? undefined : text}
        {...props}
      />
    }
    selectedItemRenderer={() => null}
  />
}
