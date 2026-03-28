import { Teacher } from 'types'

import { useCreateVolunteer, useVolunteers } from 'services/volunteers'

import { FieldComponentProps } from 'libraries/forms'
import { AutocompleteMultipleInput } from 'libraries/formsV2/components/inputs/selectors'
import { useT } from 'i18n'

type Volunteer = Omit<Teacher, '__typename'>
type SelectableValue = (Volunteer & { __typename?: 'Volunteer' })
  | { __typename: 'createVolunteer', name: string }

export default function TeacherSelector(props: FieldComponentProps<Volunteer[]>) {
  const t = useT('components.volunteerSelector')
  const [volunteers] = useVolunteers()
  const [createVolunteer] = useCreateVolunteer()

  const getItems = (query: string) => {
    const volunteerList = volunteers.filter(volunteer => volunteer.name.toLowerCase().includes(query.toLowerCase()))
    const showCreateVolunteer = query.trim().length > 0
      && !volunteers.some(volunteer => volunteer.name.toLowerCase() === query.trim().toLowerCase())
    const extraItems: SelectableValue[] = []
    if (showCreateVolunteer) extraItems.push({ __typename: 'createVolunteer', name: query.trim() })
    return [...volunteerList, ...extraItems]
  }

  const chooseOrCreateVolunteer = async (option: SelectableValue) => {
    if (option.__typename === 'createVolunteer') {
      const response = await createVolunteer({ volunteer: { name: option.name } })
      return response.data?.createVolunteer
    }
    return option
  }
  const onChange = async (options: SelectableValue[]) => {
    const volunteers = await Promise.all(options.map(chooseOrCreateVolunteer))
    props.onChange(volunteers.filter(v => v !== undefined))
  }

  return <AutocompleteMultipleInput<SelectableValue>
    items={getItems}
    placeholder={t('addVolunteer')}
    noResultsText={t('noVolunteers')}
    {...props}
    onChange={onChange}
    value={props.value ?? []}
    itemToString={option => option.name}
    itemRenderer={option => {
      if (option.__typename === 'createVolunteer') {
        return `${option.name} (${t('createNewVolunteer')})`
      }
      return option.name
    }}
  />
}
