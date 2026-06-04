import { EventVolunteerRegistrationStatus } from 'types'

import { Select } from 'libraries/formsV2/components/inputs/selectors'
import { Button } from 'libraries/ui'
import { CaretDown, Cross, Envelope, NewPerson, TickCircle } from 'libraries/ui/icons'
import { useT, useTranslation } from 'i18n'

const statuses: EventVolunteerRegistrationStatus[] = ['None', 'RegisteredToEventSystem', 'AcceptedRegistration', 'InformedToOrganizers', 'RegistrationCancelled']

const validStatuses: Record<EventVolunteerRegistrationStatus, EventVolunteerRegistrationStatus[]> = {
  None: ['RegisteredToEventSystem', 'AcceptedRegistration', 'InformedToOrganizers', 'RegistrationCancelled'],
  RegisteredToEventSystem: ['None', 'AcceptedRegistration', 'RegistrationCancelled'],
  AcceptedRegistration: ['None', 'RegistrationCancelled'],
  InformedToOrganizers: ['None', 'RegistrationCancelled'],
  RegistrationCancelled: ['None'],
}
export const statusIcons: Record<EventVolunteerRegistrationStatus, React.ReactNode> = {
  None: <NewPerson className="text-gray-400" />,
  RegisteredToEventSystem: <Envelope className="text-yellow-500" />,
  AcceptedRegistration: <TickCircle className="text-green-600" />,
  InformedToOrganizers: <TickCircle className="text-blue-500" />,
  RegistrationCancelled: <Cross className="text-red-800" />,
}

export function RegistrationStatusSelector({ id, className, value, onChange, disabled, showText }: {
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
  const validOptions = statuses.filter(status => values.every(v => status === v || validStatuses[v].includes(status)))

  const text = commonValue ? t(commonValue) : undefined
  return <Select<EventVolunteerRegistrationStatus | null>
    id={id}
    containerClassname={className}
    readOnly={disabled}
    value={commonValue ?? null}
    placeholder={choose}
    onChange={status => status && onChange(status)}
    items={validOptions}
    itemIcon={status => statusIcons[status ?? 'None']}
    itemToString={status => status ? t(status) : choose}
    buttonRenderer={(selectedItem, props) =>
      <Button
        minimal
        icon={statusIcons[selectedItem ?? 'None']}
        rightIcon={<CaretDown />}
        text={showText ? (text ?? choose) : undefined}
        tooltip={showText ? undefined : text}
        {...props}
      />
    }
    selectedItemRenderer={() => null}
  />
}

export function RegistrationStatusLegend() {
  const t = useT('domain.EventVolunteerAssignmentRegistrationStatus')
  return <div className="inline-flex flex-wrap gap-2">
    {statuses.map(status => <span key={status} className="flex items-center gap-1 w-max">
      {statusIcons[status]} =
      <span>{t(status)}</span>
    </span>)}
  </div>
}
