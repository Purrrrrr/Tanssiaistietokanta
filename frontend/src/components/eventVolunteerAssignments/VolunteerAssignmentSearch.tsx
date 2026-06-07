import { EventVolunteerAssignment, EventVolunteerRegistrationStatus, Workshop } from 'types'
import { SyncItems } from 'libraries/formsV2/components/inputs/selectors/types'

import { useEventRoles } from 'services/eventRoles'
import { useEventVolunteers } from 'services/eventVolunteers'
import { workshopInstanceName } from 'services/workshops'

import { searchList } from 'libraries/common/listSearch'
import { AutocompleteMultipleInput } from 'libraries/formsV2/components/inputs/selectors'
import { Button } from 'libraries/ui'
import { Build, Cross, Hat, Person, Search } from 'libraries/ui/icons'
import { useT, useTranslation } from 'i18n'

import RegistrationStatusIcon from './RegistrationStatusIcon'

export type AssignmentSearchTerm = {
  type: 'role' | 'name' | 'registrationStatus'
  query: string
} | {
  type: 'workshop'
  query: string | null
  instance?: string | null
}

export function parseSearch(json: unknown): AssignmentSearchTerm[] {
  if (!Array.isArray(json)) return []
  return json.map(item => {
    if (typeof item !== 'object' || item === null) return null
    if (item.type === 'workshop') {
      if (typeof item.query !== 'string' && item.query !== null) return null
      return {
        type: 'workshop',
        query: item.query,
        instance: typeof item.instance === 'string' ? item.instance : null,
      }
    }
    if (item.type === 'role' || item.type === 'name' || item.type === 'registrationStatus') {
      if (typeof item.query !== 'string') return null
      return {
        type: item.type,
        query: item.query,
      }
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
    (!searchGroups.workshop || searchGroups.workshop.some(term => {
      if (term.query === null) return a.workshop == null
      return a.workshop?.name === term.query &&
        ('instance' in term && (term.instance == null || !a.workshopInstanceIds || a.workshopInstanceIds.includes(term.instance)))
    })) &&
    (!searchGroups.registrationStatus || searchGroups.registrationStatus.some(term => a.registrationStatus === term.query)),
  )
}

interface VolunteerAssignmentSearchProps {
  id: string
  value: AssignmentSearchTerm[]
  onChange: (value: AssignmentSearchTerm[]) => void
  eventId: string
  eventVersionId?: string | null
  workshops: Pick<Workshop, '_id' | 'name' | 'instances'>[]
}

export function VolunteerAssignmentSearch({ id, value, onChange, eventId, eventVersionId, workshops }: VolunteerAssignmentSearchProps) {
  const [roles] = useEventRoles()
  const [eventVolunteers] = useEventVolunteers({ eventId, eventVersionId })
  const t = useT('components.volunteerAssignmentEditor')
  const statusT = useT('domain.EventVolunteerAssignmentRegistrationStatus')

  const items = (query: string): SyncItems<AssignmentSearchTerm> => {
    const instances = workshops.flatMap(
      ({ _id, name, instances }): { _id: string, name: string, instance: string | null }[] => {
        const allWorkshops = { _id, name, instance: null }
        return instances.length === 1
          ? [allWorkshops]
          : [allWorkshops, ...instances.map(i => ({ _id, name, instance: i._id }))]
      })
    return {
      categories: [
        {
          title: t('role'),
          items: searchList(roles, query, 'name').map(role => ({ type: 'role', query: role.name })),
        },
        {
          title: t('workshop'),
          items: [
            ...searchList([t('noWorkshop')], query, (x: string) => x).map(() => ({ type: 'workshop' as const, query: null })),
            ...searchList(
              instances,
              query, 'name',
            ).map(({ name, instance }) => ({ type: 'workshop' as const, query: name, instance })),
          ],
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
          items: searchList(eventVolunteers, query, ev => ev.volunteer.name).map(ev => ({ type: 'name', query: ev.volunteer.name })),
        },
      ],
    }
  }
  const instanceToName = (instanceId?: string | null) => {
    if (!instanceId) return null
    const instanceWorkshop = workshops.find(w => w.instances.some(i => i._id === instanceId))
    if (!instanceWorkshop) return null
    const instanceIdx = instanceWorkshop.instances.findIndex(i => i._id === instanceId)

    return workshopInstanceName(instanceIdx, instanceWorkshop.instances[instanceIdx])
  }
  const itemToString = (item: AssignmentSearchTerm) => {
    if (item.type === 'workshop') {
      const name = item.query ?? t('noWorkshop')
      const instanceName = instanceToName(item.instance)
      if (!instanceName) return name

      return `${name} (${instanceName})`
    }
    if (item.type === 'registrationStatus') return statusT(item.query as EventVolunteerRegistrationStatus)
    return item.query
  }
  const itemIcon = (item: AssignmentSearchTerm) => {
    switch (item.type) {
      case 'role':
        return <Hat className="text-lime-600" />
      case 'name':
        return <Person className="text-blue-300" />
      case 'workshop':
        return <Build className="text-red-700" />
      case 'registrationStatus':
        return <RegistrationStatusIcon status={item.query as EventVolunteerRegistrationStatus} />
    }
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
        onClick={() => onChange([])}
      />
    }
    placeholder={useTranslation('common.search')}
    itemToString={itemToString}
    itemIcon={itemIcon}
    selectedItemRenderer={item => <span className="flex items-center gap-2">
      {itemIcon(item)}{itemToString(item)}
    </span>}
    itemHidden={item => item.type === 'name'
      ? value.some(v => v.type === 'name')
      : value.some(v => v.type === item.type && v.query === item.query)}
    items={items}
  />
}
