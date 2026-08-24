import classNames from 'classnames'

import { quickNumberHash } from 'libraries/common/hashString'
import { useContrastCheck } from 'libraries/common/useContrastRatio'

import { type ColorScheme, defaultScheme } from './tagColorSchemes'

export interface TagProps extends Omit<React.HTMLAttributes<HTMLSpanElement> & React.HTMLAttributes<HTMLButtonElement>, 'color'> {
  tag?: React.ReactNode
  title: string
  hashSource?: string | number
  color?: number
  colorScheme?: ColorScheme
  small?: boolean
  selected?: boolean
  debugContrast?: boolean
}

export function Tag({
  tag,
  title,
  hashSource,
  color,
  colorScheme = defaultScheme,
  small = false,
  selected,
  debugContrast = false,
  children,
  className,
  ...props
}: TagProps) {
  const colorIndex = Math.abs(
    color ??
      (typeof hashSource === 'number'
        ? hashSource
        : quickNumberHash(hashSource ?? title)),
  ) % colorScheme.colorCount
  const colors = colorScheme(colorIndex, selected)
  const [ref, contrast] = useContrastCheck<HTMLSpanElement & HTMLButtonElement>()
  const Element = props.onClick ? 'button' : 'span'

  return <Element
    ref={ref}
    className={classNames(
      className,
      colors.className ?? 'tag',
      'inline-block px-1.5 rounded-lg overflow-hidden',
      props.onClick && 'cursor-pointer hover:brightness-95 active:brightness-85',
      small
        ? 'my-0.5 text-xs'
        : 'leading-5.5',
    )}
    style={{
      '--tag-bg': colors.background,
      '--tag-color': colors.text,
      '--tag-border': colors.border,
      '--tag-counter-bg': colors.counterBackground,
      '--tag-counter-color': colors.counterText,
    } as React.CSSProperties}
    {...props}
  >
    {tag &&
      <span className={classNames(
        colors.counterClassName ?? 'counter',
        'text-center font-bold inline-block h-full rounded-lg -ms-1.5',
        small ? 'px-1 me-0.5' : 'min-w-5.5 px-1.5 me-1',
      )}>
        {tag}
      </span>}
    {title}
    {children}
    {debugContrast && contrastDebug(contrast)}
    {debugContrast && colors.debug}
  </Element>
}

function contrastDebug(contrast: number) {
  const contrastStr = ` (${contrast.toFixed(1)})`
  return contrast < 4.5 ? <span className="bg-white text-red-500">{contrastStr}</span> : contrastStr
}
