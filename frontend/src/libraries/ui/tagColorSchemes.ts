import classNames from 'classnames'

interface TagColors {
  background?: string
  text?: string
  border?: string
  counterBackground?: string
  counterText?: string
  className?: string
  counterClassName?: string
  debug?: string
}
export interface ColorScheme {
  (i: number, selected: boolean | undefined): TagColors
  colorCount: number
}

const toStyle = (space: string, colors: (number | string)[] | undefined) => colors !== undefined
  ? `${space}(${colors.join(' ')})`
  : undefined

export function colorScheme(colorCount: number, fun: (i: number, selected: boolean | undefined) => TagColors): ColorScheme {
  const scheme = (i: number, selected: boolean | undefined) => fun(i % colorCount, selected)
  scheme.colorCount = colorCount
  return scheme
}

export const defaultScheme = colorScheme(1, () => ({}))
export const lightRainbow = (count: number, hueCorrection: number = 0.03) => colorScheme(count, (i, selected) => {
  const position = (i / count + hueCorrection) % 1
  const hue = position * 360
  const l = correctionAround(position, 0.35, 0.3) * 35
  return {
    background: toStyle('hsl', [hue, selectedValue(selected, 100, 100, 80), selectedValue(selected, 97, 87, 97)]),
    text: toStyle('hsl', [hue, 90, 34 - l]),
    border: toStyle('hsl', [hue, 20, 65]),
    counterBackground: toStyle('hsl', [hue, 90, 92]),
    counterText: toStyle('hsl', [hue, 90, 15]),
  } satisfies TagColors
})
export const rainbow = (count: number, hueCorrection: number = 0.03) => colorScheme(count, (i, selected) => {
  const position = (i / count + hueCorrection) % 1
  const hue = position * 360
  const l = correctionAround(position, 0.69, 0.51) ** 2
  const isWhite = l > 0.90 && selected !== false
  return {
    background: toStyle('hsl', [
      hue,
      selectedValue(selected, 90, 90, 70),
      isWhite
        ? 75 - l * 30 + selectedValue(selected, 0, 0, 25)
        : 70 + correctionAround(position, 0.07, 0.12) * 8 + selectedValue(selected, 0, 0, 15),
    ]),
    text: toStyle('hsl', [hue, 0, isWhite ? 100 : 0]),
    border: toStyle('hsl', [hue, 20, 45]),
    counterBackground: toStyle('hsl', [hue, 90, 92 + selectedValue(selected, 0, -5, 0)]),
    counterText: toStyle('hsl', [hue, 90, 22]),
  } satisfies TagColors
})

const tailwindColors = [
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
]
export const tailwindLight = colorScheme(tailwindColors.length, (i, selected) => {
  const className = tailwindColors[i % tailwindColors.length]
  return {
    className: classNames(
      className,
      'inset-ring-2 font-bold',
      selectedValue(selected, 'saturate-60', 'saturate-90', 'saturate-30'),
    ),
    counterClassName: classNames('text-white inset-ring-20', className.replace(/.* /, '')),
  } satisfies TagColors
})

const correctionAround = (value: number, around: number, wideness: number) => {
  const distance = Math.abs(value - around)
  const factor = Math.max(0, 1 - distance / wideness)
  return Math.sin(factor * Math.PI / 2)
}

function selectedValue<T>(selected: boolean | undefined, notSelectableValue: T, trueValue: T, falseValue: T) {
  console.log(selected)
  if (selected === undefined) return notSelectableValue
  if (selected === false) return falseValue
  return trueValue
}
