import { EventRole } from 'types'

import { ColoredTag, ColoredTagProps } from 'components/widgets/ColoredTag'

export interface RoleTagProps extends Omit<ColoredTagProps, 'hashSource' | 'title'> {
  role: Pick<EventRole, '_id' | 'name' | 'order'>
  icon?: React.ReactNode
  title?: string
  onSetRole?: (roleId: string | undefined) => void
}

export function RoleTag({ role, icon, title, onSetRole, ...props }: RoleTagProps) {
  return <ColoredTag
    {...props}
    hashSource={role.order * 2 - 1}
    title=""
    onClick={onSetRole
      ? () => onSetRole(props.selected ? undefined : role._id)
      : props.onClick
    }
  >
    {title ?? role.name}
    {icon && <span className="ms-1 opacity-70">{icon}</span>}
  </ColoredTag>
}
