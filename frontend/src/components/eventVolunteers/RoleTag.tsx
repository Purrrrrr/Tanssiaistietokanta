import { EventRole } from 'types'

import { Tag, TagProps } from 'libraries/ui'
import { tailwindLight } from 'libraries/ui/tagColorSchemes'

export interface RoleTagProps extends Omit<TagProps, 'hashSource' | 'title' | 'role'> {
  role: Pick<EventRole, '_id' | 'name' | 'order'>
  icon?: React.ReactNode
  title?: string
  onSetRole?: (roleId: string | undefined) => void
}

export function RoleTag({ role, icon, title, onSetRole, ...props }: RoleTagProps) {
  return <Tag
    {...props}
    colorScheme={tailwindLight}
    hashSource={role.order * 2 - 1}
    title=""
    onClick={onSetRole
      ? () => onSetRole(props.selected ? undefined : role._id)
      : props.onClick
    }
  >
    {title ?? role.name}
    {icon && <span className="ms-1 opacity-70">{icon}</span>}
  </Tag>
}
