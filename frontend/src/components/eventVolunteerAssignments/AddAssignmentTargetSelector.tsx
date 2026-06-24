import { EventRole, VolunteerListItem } from 'types'
import { FieldComponentProps } from 'libraries/forms/types'
import { SyncItems } from 'libraries/formsV2/components/inputs/selectors/types'

import { useEventRoles } from 'services/eventRoles'
import { useEventVolunteers } from 'services/eventVolunteers'

import { searchList } from 'libraries/common/listSearch'
import { AutocompleteInput } from 'libraries/formsV2/components/inputs/selectors'
import { ClearButton } from 'libraries/ui'
import { Hat, Person } from 'libraries/ui/icons'
import { useT, useTranslation } from 'i18n'

export type AssignmentTarget = Required<EventRole | VolunteerListItem>

interface AddAssignmentTargetSelectorProps extends FieldComponentProps<AssignmentTarget | null> {
  eventId: string
  eventVersionId?: string | null
}

export function AddAssignmentTargetSelector({ value, onChange, eventId, eventVersionId, ...props }: AddAssignmentTargetSelectorProps) {
  const [roles] = useEventRoles()
  const [eventVolunteers] = useEventVolunteers({ eventId, eventVersionId })
  const volunteers = eventVolunteers.map(ev => ev.volunteer)
  const t = useT('components.addVolunteerAssignmentForm')

  const items = (query: string): SyncItems<AssignmentTarget> => {
    return {
      categories: [
        {
          title: t('role'),
          items: searchList(roles as AssignmentTarget[], query, 'name'),
        },
        {
          title: t('volunteer'),
          items: searchList(volunteers as AssignmentTarget[], query, ev => ev.name),
        },
      ],
    }
  }
  const itemToString = (item: AssignmentTarget) => {
    return item.name
  }
  const itemIcon = (item: AssignmentTarget) => {
    switch (item.__typename) {
      case 'EventRole':
        return <Hat className="text-lime-600" />
      case 'Volunteer':
        return <Person className="text-blue-300" />
    }
  }

  return <AutocompleteInput<AssignmentTarget>
    {...props}
    value={value}
    onChange={onChange}
    placeholder={useTranslation('common.search')}
    itemToString={itemToString}
    itemIcon={itemIcon}
    rightIcon={
      value && <ClearButton aria-label={t('empty')} onClick={() => onChange(null)} />
    }
    items={items}
  />
}
