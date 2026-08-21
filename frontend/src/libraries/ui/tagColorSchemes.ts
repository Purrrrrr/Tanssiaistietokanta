interface TagColors {
  background?: string
  text?: string
  border?: string
  counterBackground?: string
  counterText?: string
  debug?: string
}
export interface ColorScheme {
  (i: number, selected: boolean | undefined): TagColors
  colorCount: number
}

const toStyle = (space: string, colors: (number | string)[] | undefined) => colors !== undefined
  ? `${space}(${colors.join(' ')})`
  : undefined

function colorScheme(colorCount: number, fun: (i: number, selected: boolean | undefined) => TagColors): ColorScheme {
  const scheme = (i: number, selected: boolean | undefined) => fun(i % colorCount, selected)
  scheme.colorCount = colorCount
  return scheme
}

export const defaultScheme = colorScheme(1, () => ({}))
export const lightRainbow = (count: number) => colorScheme(count, (i, selected) => {
  const position = (i / count + 0.03) % 1
  const hue = position * 360
  const l = correctionAround(position, 0.35, 0.3) * 35
  return {
    background: toStyle('hsl', [hue, 100, 97]),
    text: toStyle('hsl', [hue, 90, 34 - l]),
    border: toStyle('hsl', [hue, 20, 65]),
    counterBackground: toStyle('hsl', [hue, 90, 92]),
    counterText: toStyle('hsl', [hue, 90, 15]),
  } satisfies TagColors
})
export const rainbow = (count: number) => colorScheme(count, i => {
  const position = (i / count + 0.03) % 1
  const hue = position * 360
  const l = correctionAround(position, 0.69, 0.51) ** 2
  const isWhite = l > 0.90
  return {
    background: toStyle('hsl', [
      hue,
      90,
      isWhite
        ? 75 - l * 30
        : 70 + correctionAround(position, 0.07, 0.12) * 8,
    ]),
    text: toStyle('hsl', [hue, 0, isWhite ? 100 : 0]),
    border: toStyle('hsl', [hue, 20, 65]),
    counterBackground: toStyle('hsl', [hue, 90, 92]),
    counterText: toStyle('hsl', [hue, 90, 22]),
  } satisfies TagColors
})

const correctionAround = (value: number, around: number, wideness: number) => {
  const distance = Math.abs(value - around)
  const factor = Math.max(0, 1 - distance / wideness)
  return Math.sin(factor * Math.PI / 2)
}
