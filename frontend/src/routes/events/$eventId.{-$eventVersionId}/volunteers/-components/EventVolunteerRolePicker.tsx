import { EventRole } from 'types'

import { useEventRoles } from 'services/eventRoles'

import { FieldComponentProps } from 'libraries/forms'
import { useT } from 'i18n'

export type EventRoleSelectorProps = FieldComponentProps<EventRole[]>

export function EventVolunteerRolePicker({
  value, onChange, readOnly, 'aria-label': ariaLabel, 'aria-describedby': ariaDescribedby,
}: EventRoleSelectorProps) {
  const t = useT('components.eventRoleSelector')
  const [roles] = useEventRoles()

  const toggle = (role: EventRole) => {
    const isSelected = (value ?? []).some(r => r._id === role._id)
    const next = isSelected
      ? (value ?? []).filter(r => r._id !== role._id)
      : [...(value ?? []), role]
    onChange(next.sort((a, b) => a._id.localeCompare(b._id)))
  }

  const workshopRoles = (roles ?? []).filter(r => r.appliesToWorkshops)
  const eventRoles = (roles ?? []).filter(r => !r.appliesToWorkshops)

  const renderGroup = (groupRoles: EventRole[], title: string) => {
    if (groupRoles.length === 0) return null
    return <div>
      <h3 className="mt-2 mb-1 font-semibold">{title}</h3>
      <div className="flex flex-wrap gap-3">
        {groupRoles.map(role =>
          <label key={role._id} className="inline-flex gap-1 items-center cursor-pointer">
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
      </div>
    </div>
  }

  return <div className="flex flex-wrap gap-4">
    {renderGroup(workshopRoles, t('workshopRoles'))}
    {renderGroup(eventRoles, t('eventRoles'))}
  </div>
}
