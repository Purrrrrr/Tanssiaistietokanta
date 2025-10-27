export function toMinSec(value: number) {
  const rounded = Math.round(value)
  const seconds = rounded % 60
  const minutes = Math.floor(rounded / 60)
  return [minutes, seconds]
}

export function toSeconds(minutes: number, seconds: number) {
  return Math.max(seconds + (minutes * 60), 0)
}

export const prefixZero = (value: number) => (value < 10 ? '0' : '') + value

export function durationToString(value: number | undefined) {
  if (!value || value < 0) return '0:00'
  const [minutes, seconds] = toMinSec(value)
  return minutes + ':' + prefixZero(seconds)
}

export function parseDuration(duration: string) {
  const numbers = duration
    .replace(/[^0-9:]/g, '')
    .split(/:+/)
    .map(parseFloat)
    .map(f => Number.isFinite(f) ? f : 0)
    .map((f, index) => (index === 0 ? f : Math.min(f, 59)))

  if (!numbers.length) return 0
  return numbers.reduce((accumulator, value) => accumulator * 60 + value)
}
