import { MouseEventHandler } from 'react'
import classNames from 'classnames'

const colors = [
  classNames('bg-red-100 text-red-950 inset-ring-red-600'),
  classNames('bg-orange-100 text-orange-950 inset-ring-orange-600'),
  classNames('bg-amber-100 text-amber-950 inset-ring-amber-600'),
  classNames('bg-yellow-100 text-yellow-950 inset-ring-yellow-600'),
  classNames('bg-lime-100 text-lime-950 inset-ring-lime-600'),
  classNames('bg-green-100 text-green-950 inset-ring-green-600'),
  classNames('bg-emerald-100 text-emerald-950 inset-ring-emerald-600'),
  classNames('bg-teal-100 text-teal-950 inset-ring-teal-600'),
  classNames('bg-cyan-100 text-cyan-950 inset-ring-cyan-600'),
  classNames('bg-sky-100 text-sky-950 inset-ring-sky-600'),
  classNames('bg-blue-100 text-blue-950 inset-ring-blue-600'),
  classNames('bg-indigo-100 text-indigo-950 inset-ring-indigo-600'),
  classNames('bg-violet-100 text-violet-950 inset-ring-violet-600'),
  classNames('bg-purple-100 text-purple-950 inset-ring-purple-600'),
  classNames('bg-fuchsia-100 text-fuchsia-950 inset-ring-fuchsia-600'),
  classNames('bg-pink-100 text-pink-950 inset-ring-pink-600'),
  classNames('bg-rose-100 text-rose-950 inset-ring-rose-600'),

  classNames('bg-red-300 text-red-950 inset-ring-red-500'),
  classNames('bg-orange-300 text-orange-950 inset-ring-orange-500'),
  classNames('bg-amber-300 text-amber-950 inset-ring-amber-500'),
  classNames('bg-yellow-300 text-yellow-950 inset-ring-yellow-500'),
  classNames('bg-lime-300 text-lime-950 inset-ring-lime-500'),
  classNames('bg-green-300 text-green-950 inset-ring-green-500'),
  classNames('bg-emerald-300 text-emerald-950 inset-ring-emerald-500'),
  classNames('bg-teal-300 text-teal-950 inset-ring-teal-500'),
  classNames('bg-cyan-300 text-cyan-950 inset-ring-cyan-500'),
  classNames('bg-sky-300 text-sky-950 inset-ring-sky-500'),
  classNames('bg-blue-300 text-blue-950 inset-ring-blue-500'),
  classNames('bg-indigo-300 text-indigo-950 inset-ring-indigo-500'),
  classNames('bg-violet-300 text-violet-950 inset-ring-violet-500'),
  classNames('bg-purple-300 text-purple-950 inset-ring-purple-500'),
  classNames('bg-fuchsia-300 text-fuchsia-950 inset-ring-fuchsia-500'),
  classNames('bg-pink-300 text-pink-950 inset-ring-pink-500'),
  classNames('bg-rose-300 text-rose-950 inset-ring-rose-500'),

  classNames('bg-red-700 text-red-50 inset-ring-red-500'),
  classNames('bg-orange-700 text-orange-50 inset-ring-orange-500'),
  classNames('bg-amber-700 text-amber-50 inset-ring-amber-500'),
  classNames('bg-yellow-700 text-yellow-50 inset-ring-yellow-500'),
  classNames('bg-lime-700 text-lime-50 inset-ring-lime-500'),
  classNames('bg-green-700 text-green-50 inset-ring-green-500'),
  classNames('bg-emerald-700 text-emerald-50 inset-ring-emerald-500'),
  classNames('bg-teal-700 text-teal-50 inset-ring-teal-500'),
  classNames('bg-cyan-700 text-cyan-50 inset-ring-cyan-500'),
  classNames('bg-sky-700 text-sky-50 inset-ring-sky-500'),
  classNames('bg-blue-700 text-blue-50 inset-ring-blue-500'),
  classNames('bg-indigo-700 text-indigo-50 inset-ring-indigo-500'),
  classNames('bg-violet-700 text-violet-50 inset-ring-violet-500'),
  classNames('bg-purple-700 text-purple-50 inset-ring-purple-500'),
  classNames('bg-fuchsia-700 text-fuchsia-50 inset-ring-fuchsia-500'),
  classNames('bg-pink-700 text-pink-50 inset-ring-pink-500'),
  classNames('bg-rose-700 text-rose-50 inset-ring-rose-500'),
]
export const TAG_COLOR_COUNT = colors.length

interface ColoredTagProps {
  tag?: string | number
  title: string
  hashSource?: string
  color?: number
  small?: boolean
  onClick?: MouseEventHandler
}

export function ColoredTag({ tag, title, hashSource, color, small, onClick }: ColoredTagProps) {
  const colorIndex = Math.abs(color ?? hash(hashSource ?? title)) % TAG_COLOR_COUNT
  const className = colors[colorIndex]
  const Element = onClick ? 'button' : 'span'
  return <Element
    onClick={onClick}
    className={classNames(
      className,
      'align-middle inline-block px-2 mx-0.5 font-bold rounded-full overflow-hidden',
      onClick && 'cursor-pointer hover:brightness-95 active:brightness-85',
      small
        ? 'my-0.5 text-xs inset-ring-2'
        : 'leading-5.5 h-6 inset-ring-2',
    )}
  >
    {tag &&
      <span className={classNames(
        className.replace(/text-\w+-\d+/, 'text-white'),
        'text-shadow-sm text-shadow-black/20 inline-block inset-ring-20 h-full rounded-e-full -ms-2 me-1',
        small ? 'px-1.5' : 'px-2',
      )}>
        {tag}
      </span>}
    {title}
  </Element>
}

function hash(title: string): number {
  return title
    .split('')
    .map(s => s.codePointAt(0) ?? 0)
    .reduce((acc, code) => code + (acc << 5) - acc, 0)
}
