import { GrantRole } from 'types/gql/graphql'

import { FieldComponentProps } from 'libraries/forms'
import { Select } from 'libraries/formsV2/components/inputs'
import { Edit, Search, Star } from 'libraries/ui/icons'
import { useT } from 'i18n'

const itemIcons: Record<GrantRole, React.ReactNode> = {
  [GrantRole.Organizer]: <Star className="text-amber-400 drop-shadow-stone-800/30 drop-shadow-xs" />,
  [GrantRole.Teacher]: <Edit className="text-red-600 drop-shadow-stone-800/30 drop-shadow-xs" />,
  [GrantRole.Viewer]: <Search className="text-blue-500 drop-shadow-stone-800/30 drop-shadow-xs" />,
}

export function EventRoleSelector({ value, ...props }: FieldComponentProps<GrantRole>) {
  const t = useT('components.grantEditor.roles')

  return (
    <Select<GrantRole>
      value={value ?? GrantRole.Viewer}
      items={[
        GrantRole.Organizer, GrantRole.Teacher, GrantRole.Viewer,
      ]}
      itemToString={t}
      itemIcon={role => itemIcons[role]}
      {...props}
    />
  )
}
