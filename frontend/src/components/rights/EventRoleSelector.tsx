import { EventGrantRole } from 'types/gql/graphql'

import { FieldComponentProps } from 'libraries/forms'
import { Select } from 'libraries/formsV2/components/inputs'
import { Edit, Search, Star } from 'libraries/ui/icons'
import { useT } from 'i18n'

const eventRoleIcons: Record<EventGrantRole, React.ReactNode> = {
  [EventGrantRole.Organizer]: <Star className="text-amber-400 drop-shadow-stone-800/30 drop-shadow-xs" />,
  [EventGrantRole.Teacher]: <Edit className="text-red-600 drop-shadow-stone-800/30 drop-shadow-xs" />,
  [EventGrantRole.Viewer]: <Search className="text-blue-500 drop-shadow-stone-800/30 drop-shadow-xs" />,
}

export function EventRoleSelector({ value, readOnly, ...props }: FieldComponentProps<EventGrantRole>) {
  const t = useT('components.grantEditor.roles')

  if (readOnly) {
    if (!value) return null
    return <span>{eventRoleIcons[value]} {t(value)}</span>
  }

  return (
    <Select<EventGrantRole>
      value={value ?? EventGrantRole.Viewer}
      items={[
        EventGrantRole.Organizer, EventGrantRole.Teacher, EventGrantRole.Viewer,
      ]}
      itemToString={t}
      itemIcon={role => eventRoleIcons[role]}
      {...props}
    />
  )
}
