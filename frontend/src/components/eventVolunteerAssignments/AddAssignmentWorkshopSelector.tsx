import { Event, Workshop } from 'types'

import { FieldComponentProps } from 'libraries/forms'
import { AutocompleteInput } from 'libraries/formsV2/components/inputs/selectors'
import { ClearButton } from 'libraries/ui'
import { Build } from 'libraries/ui/icons'
import { useT } from 'i18n'

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
    itemIcon={() => <Build className="text-red-700" />}
    rightIcon={value && <ClearButton onClick={() => onChange(null)} aria-label={t('empty')} />}
    noResultsText={t('noResults')}
  />
}
