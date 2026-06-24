import { ID } from 'types'

import { workshopInstanceName } from 'services/workshops'

import { ModeButton, ModeSelector } from 'libraries/ui'
import { useT } from 'i18n'

export function WorkshopInstanceSelector({ workshopInstances, readOnly, value, onChange, className }: {
  workshopInstances: {
    _id: ID
    abbreviation?: string | null
  }[]
  readOnly?: boolean
  value: ID[] | null | undefined
  onChange: (instanceIds: ID[] | null) => void
  className?: string
}) {
  const t = useT('components.volunteerAssignmentEditor')
  return workshopInstances && workshopInstances.length > 1 && <ModeSelector className={className}>
    <ModeButton
      disabled={readOnly}
      selected={value == null}
      onClick={() => onChange(null)}
    >
      {t('allInstances')}
    </ModeButton>
    {workshopInstances.map((instance, index) => {
      const selected = value?.includes(instance._id) ?? false
      return (
        <ModeButton
          key={instance._id}
          disabled={readOnly}
          selected={selected}
          onClick={() => onChange(
            selected
              ? value?.filter(id => id !== instance._id) ?? null
              : [...(value ?? []), instance._id],
          )}
        >
          {workshopInstanceName(index, instance)}
        </ModeButton>
      )
    })}
  </ModeSelector>
}
