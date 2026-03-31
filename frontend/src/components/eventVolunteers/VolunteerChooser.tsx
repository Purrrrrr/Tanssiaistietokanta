import { useVolunteers } from 'services/volunteers'

import { FieldComponentProps } from 'libraries/forms'
import { AutocompleteInput } from 'libraries/formsV2/components/inputs'
import { useT } from 'i18n'

interface VolunteerItem { _id: string, name: string }

export type VolunteerChooserProps = FieldComponentProps<VolunteerItem | null>

export function VolunteerChooser({ value, onChange, readOnly, ...props }: VolunteerChooserProps) {
  const t = useT('components.volunteerChooser')
  const [volunteers] = useVolunteers()

  const getItems = (query: string) => {
    const q = query.trim().toLowerCase()
    return q
      ? (volunteers ?? []).filter(v => v.name.toLowerCase().includes(q))
      : (volunteers ?? [])
  }

  return <AutocompleteInput<VolunteerItem>
    {...props}
    placeholder={t('searchVolunteer')}
    items={getItems}
    value={value}
    onChange={onChange}
    readOnly={readOnly}
    itemToString={item => item?.name ?? ''}
    itemRenderer={item => item.name}
  />
}
