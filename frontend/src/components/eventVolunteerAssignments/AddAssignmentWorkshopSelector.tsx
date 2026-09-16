import { Event, Workshop } from '@/types'

import { FieldComponentProps } from '@/libraries/forms'
import { AutocompleteInput } from '@/libraries/formsV2/components/inputs/selectors'
import { ClearButton, Icon } from '@/libraries/ui'
import { useT } from '@/i18n'

interface AddAssignmentWorkshopSelectorProps extends FieldComponentProps<Workshop | null> {
  workshops: Event['workshops']
}

export function AddAssignmentWorkshopSelector({ workshops, value, onChange, ...props }: AddAssignmentWorkshopSelectorProps) {
  const t = useT('components.addVolunteerAssignmentForm')

  return <AutocompleteInput<Workshop>
    {...props}
    value={value}
    onChange={onChange}
    items={workshops}
    itemToString={v => v.name}
    placeholder={t('chooseWorkshop')}
    itemIcon={() => <Icon icon="build" className="text-red-700" />}
    rightIcon={value && <ClearButton onClick={() => onChange(null)} text={t('empty')} />}
    noResultsText={t('noResults')}
  />
}
