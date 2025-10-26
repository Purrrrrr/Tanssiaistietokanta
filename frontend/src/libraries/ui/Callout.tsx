import { ComponentPropsWithoutRef } from 'react'
import { Error, InfoSign, Tick, WarningSign } from '@blueprintjs/icons'
import classNames from 'classnames'

import { Color } from './types'

import { ColorClass } from './classes'

export interface CalloutProps extends ComponentPropsWithoutRef<'div'> {
  children?: React.ReactNode
  icon?: React.ReactElement | false
  intent?: Color
  title?: string
}

const defaultIcons = {
  none: undefined,
  primary: <InfoSign />,
  success: <Tick />,
  danger: <Error className="text-red-700" />,
  warning: <WarningSign />,
} satisfies Record<Color, React.ReactElement| undefined>

export function Callout({ children, icon, title, intent, className, ...rest }: CalloutProps) {
  const iconToRender = icon === false
    ? undefined
    : icon ?? defaultIcons[intent ?? 'none']
  return <>
    <div className={classNames('flex gap-2 p-4 pb-3 items-start', ColorClass.lightBoxColors[intent ?? 'none'], className)} {...rest}>
      {iconToRender}
      <div>
        {title && <h5 className="mb-1.5 font-bold mt-[-3px]">{title}</h5>}
        {children}
      </div>
    </div>
  </>
}
