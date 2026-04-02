import { EventRole } from 'types'

import { ColoredTag, ColoredTagProps } from 'components/widgets/ColoredTag'

export interface RoleTagProps extends Omit<ColoredTagProps, 'hashSource' | 'title'> {
  role: EventRole
  title?: string
  onSetRole?: (roleId: string | undefined) => void
}

export function RoleTag({ role, title, onSetRole, ...props }: RoleTagProps) {
  return <ColoredTag
    {...props}
    hashSource={role.order * 2 - 1}
    title={title ?? role.name}
    onClick={onSetRole
      ? () => onSetRole(props.selected ? undefined : role._id)
      : props.onClick
    }
  />
}
