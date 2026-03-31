import { useEventRoles } from 'services/eventRoles'

import { FieldComponentProps } from 'libraries/forms'
import { useT } from 'i18n'

interface EventRoleItem { _id: string, name: string, description: string, appliesToWorkshops: boolean, order: number }

export type EventRoleSelectorProps = FieldComponentProps<EventRoleItem[]>

export function EventRoleSelector({
  value, onChange, readOnly, 'aria-label': ariaLabel, 'aria-describedby': ariaDescribedby,
}: EventRoleSelectorProps) {
  const t = useT('components.eventRoleSelector')
  const [roles] = useEventRoles()

  const toggle = (role: EventRoleItem) => {
    const isSelected = (value ?? []).some(r => r._id === role._id)
    const next = isSelected
      ? (value ?? []).filter(r => r._id !== role._id)
      : [...(value ?? []), role]
    onChange(next.sort((a, b) => a.order - b.order))
  }

  const workshopRoles = (roles ?? []).filter(r => r.appliesToWorkshops)
  const eventRoles = (roles ?? []).filter(r => !r.appliesToWorkshops)

  const renderGroup = (groupRoles: EventRoleItem[], title: string) => {
    if (groupRoles.length === 0) return null
    return <>
      <h3 className="font-semibold mt-2 mb-1">{title}</h3>
      {groupRoles.map(role =>
        <label key={role._id} className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={(value ?? []).some(r => r._id === role._id)}
            onChange={() => toggle(role)}
            disabled={readOnly}
            aria-label={`${ariaLabel ?? ''} ${role.name}`}
            aria-describedby={ariaDescribedby}
          />
          {role.name}
        </label>,
      )}
    </>
  }

  return <div className="flex flex-col gap-1">
    {renderGroup(workshopRoles, t('workshopRoles'))}
    {renderGroup(eventRoles, t('eventRoles'))}
  </div>
}
