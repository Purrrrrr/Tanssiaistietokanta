import classNames from "classnames"

interface TagColor {
  background: string
  color: string
  textShadow?: string
}

const colors = getColors()
export const TAG_COLOR_COUNT = colors.length

interface ColoredTagProps {
  title: string
  hashSource?: string
  color?: number
  small?: boolean
}

export function ColoredTag({ title, hashSource, color, small } : ColoredTagProps) {
  const colorIndex = Math.abs(color ?? hash(hashSource ?? title)) % TAG_COLOR_COUNT
  return <span
    className={classNames(
      'inline-block py-0.5 px-2 m-0.5 font-bold text-shadow-xs rounded-xl leading-5.5',
      small || 'py-0.5 ',
    )}
    style={colors[colorIndex]}
  >
    {title}
  </span>
}

function hash(title: string): number {
  return title
    .split('')
    .map(s => s.codePointAt(0) ?? 0)
    .reduce((acc, code) => code + (acc << 5) - acc, 0)
}

function getColors() {
  const colors: TagColor[] = []
  colors.push({
    background: '#eee',
    color: '#000',
  })
  const colorCount = 12

  for (let hueIndex = 0.5; hueIndex < colorCount; hueIndex++) {
    const hue = hueIndex * 360 / colorCount
    const contrastingHue = hue + 240 % 360
    colors.push({
      background: `oklch(0.7 0.37 ${hue - 5})`,
      color: `oklch(0.99 0.02 ${contrastingHue})`,
      textShadow: '1px 1px 2px rgba(0,0,0,0.4), -1px -1px 2px rgba(0, 0, 0, 0.1)',
    })
    colors.push({
      background: `oklch(0.95 0.17 ${hue})`,
      color: `oklch(0.16 0.27 ${contrastingHue})`,
      textShadow: '1px 1px 1px rgba(255, 255, 255, 0.4)',
    })
  }

  return colors
}
