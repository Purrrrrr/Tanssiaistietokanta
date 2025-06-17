import { ComponentPropsWithoutRef } from 'react'
import classNames from 'classnames'

import { Color } from './types'

import { ColorClass } from './classes'
import { IconProp, renderIcon } from './Icon'

export interface CalloutProps extends ComponentPropsWithoutRef<'div'> {
  children?: React.ReactNode;
  icon?: IconProp | false
  intent?: Color;
  title?: string;
}

const defaultIcons = {
  none: undefined,
  primary: 'info-sign',
  success: 'tick',
  danger: 'error',
  warning: 'warning-sign',
} satisfies Record<Color, IconProp | undefined>

//TODO: fix heading margins
export function Callout({ children, icon, title, intent, className, ...rest }: CalloutProps) {
  const iconToRender = icon === false
    ? undefined
    : icon ?? defaultIcons[intent ?? 'none']
  return <>
    <div className={classNames('flex gap-2 p-4 pb-3 items-start', ColorClass.lightBoxColors[intent ?? 'none'], className)} {...rest}>
      {renderIcon(iconToRender)}
      <div>
        {title && <h5 className="text-base! mb-1.5! mt-[-3px]!">{title}</h5>}
        {children}
      </div>
    </div>
  </>
}
