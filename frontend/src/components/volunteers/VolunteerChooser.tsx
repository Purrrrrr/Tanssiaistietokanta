import { VolunteerListItem } from 'types'

import { useCreateVolunteer, useVolunteerNames } from 'services/volunteers'

import { canCreateUniqueItemFromQuery, searchList } from 'libraries/common/listSearch'
import { FieldComponentProps } from 'libraries/forms'
import { AutocompleteInput } from 'libraries/formsV2/components/inputs'
import { useT } from 'i18n'

type VolunteerOption = (VolunteerListItem & { __typename?: 'Volunteer' }) | { __typename: 'createVolunteer', name: string }

export interface VolunteerChooserProps extends FieldComponentProps<VolunteerListItem | null> {
  excludeVolunteers?: VolunteerListItem[]
}

export function VolunteerChooser({ value, onChange, readOnly, ...rest }: VolunteerChooserProps) {
  const t = useT('components.volunteerChooser')
  const [volunteers = []] = useVolunteerNames()
  const [createVolunteer] = useCreateVolunteer()

  const getItems = (query: string): VolunteerOption[] => {
    const filtered = searchList(
      volunteers.filter(v => !(rest.excludeVolunteers ?? []).some(ev => ev._id === v._id)),
      query,
      'name',
    )
    return canCreateUniqueItemFromQuery(filtered, query, 'name')
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
