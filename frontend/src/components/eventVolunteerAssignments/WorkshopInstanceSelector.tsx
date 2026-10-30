import { ID } from '@/types'
import { FieldInputComponentProps } from '@/libraries/ui/form/inputs/types'

import { workshopInstanceName } from '@/services/workshops'

import { ModeButton, ModeSelector } from '@/libraries/ui'
import { useT } from '@/i18n'

interface WorkshopInstanceSelectorProps extends FieldInputComponentProps<ID[] | null> {
  workshopInstances: {
    _id: ID
    abbreviation?: string | null
  }[]
}

export function WorkshopInstanceSelector({ workshopInstances, readOnly, value, onChange, ...rest }: WorkshopInstanceSelectorProps) {
  const t = useT('components.volunteerAssignmentEditor')
  return workshopInstances && workshopInstances.length > 1 && <ModeSelector {...rest}>
    <ModeButton
      disabled={readOnly}
      selected={value == null}
      onClick={() => onChange(null)}
      text={t('allInstances')}
    />
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
          text={workshopInstanceName(index, instance)}

        />
      )
    })}
  </ModeSelector>
}
