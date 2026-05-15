import classNames from 'classnames'

import { Color } from './types'

import { ColorClass } from './classes'

export function CounterTag({ count, title, color, showZero }: {
  count: number
  title?: string
  color?: Color
  showZero?: boolean
}) {
  if (!showZero && count === 0) {
    return null
  }

  const className = classNames(
    'inline-block px-1.5 -mt-0.5 h-5 leading-5 font-bold align-middle rounded-full ms-2',
    color === 'danger' || color === 'warning' ? ColorClass.boxColors[color] : ColorClass.lightBoxColors[color ?? 'none'],
  )
  return <span className={className} title={title}>
    {count}
  </span>
}
