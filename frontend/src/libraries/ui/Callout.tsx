import { ComponentPropsWithoutRef } from 'react'
import classNames from 'classnames'

import { Color } from './types'

import { ColorClass } from './classes'
import { Icon, type IconContent } from './Icon'

export interface CalloutProps extends ComponentPropsWithoutRef<'div'> {
  children?: React.ReactNode
  icon?: IconContent | false
  color?: Color
  title?: string
}

const defaultIcons = {
  none: undefined,
  primary: 'infoSign',
  success: 'tick',
  danger: { icon: 'error', className: 'text-red-700' },
  warning: 'warningSign',
} satisfies Record<Color, IconContent | undefined>

export function Callout({ children, icon, title, color, className, ...rest }: CalloutProps) {
  const iconToRender = icon === false
    ? undefined
    : <Icon icon={icon ?? defaultIcons[color ?? 'none']} />
  return <>
    <div className={classNames('flex gap-2 p-4 mb-1 pb-3 items-start', ColorClass.lightBoxColors[color ?? 'none'], className)} {...rest}>
      {iconToRender}
      <div>
        {title && <h5 className="mb-1.5 font-bold -mt-0.75">{title}</h5>}
        {children}
      </div>
    </div>
  </>
}
