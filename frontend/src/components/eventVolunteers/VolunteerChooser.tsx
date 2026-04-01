import { useCreateVolunteer, useVolunteers } from 'services/volunteers'

import { FieldComponentProps } from 'libraries/forms'
import { AutocompleteInput } from 'libraries/formsV2/components/inputs'
import { useT } from 'i18n'

interface VolunteerItem { _id: string, name: string }
type VolunteerOption = (VolunteerItem & { __typename?: 'Volunteer' }) | { __typename: 'createVolunteer', name: string }

export interface VolunteerChooserProps extends FieldComponentProps<VolunteerItem | null> {
  excludeVolunteers?: VolunteerItem[]
}

export function VolunteerChooser({ value, onChange, readOnly, ...rest }: VolunteerChooserProps) {
  const t = useT('components.volunteerChooser')
  const [volunteers = []] = useVolunteers()
  const [createVolunteer] = useCreateVolunteer()

  const getItems = (query: string): VolunteerOption[] => {
    const q = query.trim().toLowerCase()
    const filtered = volunteers
      .filter(v => !(rest.excludeVolunteers ?? []).some(ev => ev._id === v._id))
      .filter(v => !q || v.name.toLowerCase().includes(q))
    const showCreate = query.trim().length > 0
      && !volunteers.some(v => v.name.toLowerCase() === query.trim().toLowerCase())
    return showCreate
      ? [...filtered, { __typename: 'createVolunteer', name: query.trim() }]
      : filtered
  }

  const handleChange = async (option: VolunteerOption | null) => {
    if (!option) {
      onChange(null)
      return
    }
    if (option.__typename === 'createVolunteer') {
      const response = await createVolunteer({ volunteer: { name: option.name } })
      const created = response.data?.createVolunteer
      if (created) onChange(created)
      return
    }
    onChange(option)
  }

  return <AutocompleteInput<VolunteerOption>
    {...rest}
    placeholder={t('searchVolunteer')}
    items={getItems}
    value={value}
    onChange={handleChange}
    readOnly={readOnly}
    itemToString={item => item?.name ?? ''}
    itemRenderer={item => {
      if (item.__typename === 'createVolunteer') return `${item.name} (${t('createNewVolunteer')})`
      return item.name
    }}
  />
}
