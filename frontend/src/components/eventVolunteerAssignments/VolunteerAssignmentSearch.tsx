import { EventVolunteerAssignment, EventVolunteerRegistrationStatus } from 'types'
import { SyncItems } from 'libraries/formsV2/components/inputs/selectors/types'

import { useEventRoles } from 'services/eventRoles'

import { searchList } from 'libraries/common/listSearch'
import { AutocompleteMultipleInput } from 'libraries/formsV2/components/inputs/selectors'
import { Button } from 'libraries/ui'
import { Cross, Search } from 'libraries/ui/icons'
import { useT, useTranslation } from 'i18n'

export type AssignmentSearchTerm = {
  type: 'role' | 'name' | 'registrationStatus'
  query: string
} | {
  type: 'workshop'
  query: string | null
}

export function parseSearch(json: unknown): AssignmentSearchTerm[] {
  if (!Array.isArray(json)) return []
  return json.map(item => {
    if (typeof item !== 'object' || item === null) return null
    if (item.type === 'workshop') {
      if (typeof item.query !== 'string' && item.query !== null) return null
      return { type: 'workshop', query: item.query }
    }
    if (item.type === 'role' || item.type === 'name' || item.type === 'registrationStatus') {
      if (typeof item.query !== 'string') return null
      return { type: item.type, query: item.query }
    }
    return null
  }).filter((item): item is AssignmentSearchTerm => item !== null)
}

export function searchAssignments(assignments: EventVolunteerAssignment[], search: AssignmentSearchTerm[]) {
  const searchGroups = Object.groupBy(search, term => term.type)
  return searchList(
    assignments,
    searchGroups.name?.[0]?.query,
    a => a.volunteer.name,
  ).filter(a =>
    (!searchGroups.role || searchGroups.role.some(term => a.role.name === term.query)) &&
    (!searchGroups.workshop || searchGroups.workshop.some(term => (term.query === null ? a.workshop == null : a.workshop?.name === term.query))) &&
    (!searchGroups.registrationStatus || searchGroups.registrationStatus.some(term => a.registrationStatus === term.query)),
  )
}

interface VolunteerAssignmentSearchProps {
  id: string
  value: AssignmentSearchTerm[]
  onChange: (value: AssignmentSearchTerm[]) => void
  workshops: { _id: string, name: string }[]
}

export function VolunteerAssignmentSearch({ id, value, onChange, workshops }: VolunteerAssignmentSearchProps) {
  const [roles] = useEventRoles()
  const t = useT('components.volunteerAssignmentEditor')
  const statusT = useT('domain.EventVolunteerAssignmentRegistrationStatus')

  const items = (query: string): SyncItems<AssignmentSearchTerm> => {
    return {
      categories: [
        {
          title: t('role'),
          items: searchList(roles, query, 'name').map(role => ({ type: 'role', query: role.name })),
        },
        {
          title: t('workshop'),
          items: searchList(
            [...workshops, { _id: null, name: t('noWorkshop') }],
            query, 'name',
          ).map(workshop => ({ type: 'workshop', query: workshop._id ? workshop.name : null })),
        },
        {
          title: t('registrationStatus'),
          items: searchList(
            Object.keys(EventVolunteerRegistrationStatus) as EventVolunteerRegistrationStatus[],
            query,
            statusT,
          ).map(status => ({ type: 'registrationStatus', query: status })),
        },
        {
          title: t('name'),
          items: query
            ? [
              { type: 'name', query },
            ]
            : [],
        },
      ],
    }
  }
  const itemToString = (item: AssignmentSearchTerm) => {
    if (item.type === 'workshop') return item.query ?? t('noWorkshop')
    if (item.type === 'registrationStatus') return statusT(item.query as EventVolunteerRegistrationStatus)
    return item.query
  }

  return <AutocompleteMultipleInput<AssignmentSearchTerm>
    id={id}
    value={value}
    onChange={onChange}
    icon={<Search className="text-gray-600 ms-2" />}
    rightIcon={
      <Button
        minimal
        aria-label={useTranslation('common.emptySearch')}
        icon={<Cross className="text-gray-600" />}
        onClick={e => {
          onChange([])
          console.log(id, document.getElementById(id))
          document.getElementById(id)?.querySelector('input')?.focus()
        }}
      />
    }
    placeholder={useTranslation('common.search')}
    itemToString={itemToString}
    selectedItemRenderer={item => <>
      <strong>{t(item.type)}</strong>: {itemToString(item)}
    </>}
    itemHidden={item => item.type === 'name'
      ? value.some(v => v.type === 'name')
      : value.some(v => v.type === item.type && v.query === item.query)}
    items={items}
  />
}
