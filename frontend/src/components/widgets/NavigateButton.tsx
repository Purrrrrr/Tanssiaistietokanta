import { LinkComponent } from '@tanstack/react-router'

import { omitPermissionCheckingProps, PermissionCheckedProps, withPermissionChecking } from '@/libraries/access-control'
import { type Color, Link, TooltipContainer } from '@/libraries/ui'
import { buttonClass } from '@/libraries/ui/buttonClass'
import { Icon, type IconContent } from '@/libraries/ui/Icon'

interface NavigateButtonProps extends React.ComponentProps<typeof Link>, PermissionCheckedProps {
  text: React.ReactNode
  tooltip?: React.ReactNode
  iconOnly?: boolean
  icon?: IconContent | false
  disabled?: boolean
  minimal?: boolean
  color?: Color
  paddingClass?: string
}

const _NavigateButton = withPermissionChecking((props: NavigateButtonProps) => {
  const { text, icon, iconOnly, tooltip, disabled, minimal, color, className, paddingClass, ...rest } = omitPermissionCheckingProps(props)
  const classes = buttonClass(color ?? 'none', { className, disabled, minimal, paddingClass })

  return <TooltipContainer tooltip={tooltip ?? (iconOnly ? text : undefined)}>
    <Link {...rest} unstyled className={classes} role="button" tabIndex={0} activeProps={{}}>
      {icon && <Icon icon={icon} />}
      {iconOnly
        ? <span className="sr-only">{text}</span>
        : text
      }
    </Link>
  </TooltipContainer>
})

export const NavigateButton = _NavigateButton as LinkComponent<typeof _NavigateButton>
