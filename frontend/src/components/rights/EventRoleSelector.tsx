import { EventGrantRole } from '@/types/gql/graphql'

import { FieldComponentProps } from '@/libraries/forms'
import { Select } from '@/libraries/formsV2/components/inputs'
import { Icon } from '@/libraries/ui'
import { useT } from '@/i18n'

const eventRoleIcons: Record<EventGrantRole, React.ReactElement> = {
  organizer: <Icon icon="star" className="text-amber-400 drop-shadow-stone-800/30 drop-shadow-xs" />,
  teacher: <Icon icon="edit" className="text-red-600 drop-shadow-stone-800/30 drop-shadow-xs" />,
  viewer: <Icon icon="search" className="text-blue-500 drop-shadow-stone-800/30 drop-shadow-xs" />,
}

export function EventRoleSelector({ value, readOnly, ...props }: FieldComponentProps<EventGrantRole>) {
  const t = useT('components.grantEditor.roles')

  if (readOnly) {
    if (!value) return null
    return <span>{eventRoleIcons[value]} {t(value)}</span>
  }

  return (
    <Select<EventGrantRole>
      value={value ?? 'viewer'}
      items={[
        'organizer', 'teacher', 'viewer',
      ]}
      itemToString={t}
      itemIcon={role => eventRoleIcons[role]}
      {...props}
    />
  )
}
