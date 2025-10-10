import { useLocalization } from 'i18n'

const K = 1024
const UNIT_SWITCH_THRESHOLD = 1.1 * K
const units = [
  'byte',
  'kilobyte',
  'megabyte',
  'gigabyte',
] as const

export default function useFilesize() {
  const { locale } = useLocalization()
  const formatters = units.map(unit => Intl.NumberFormat(locale, {
    style: 'unit', unit, maximumFractionDigits: 2,
  }))
  const lastFormatter = formatters[formatters.length - 1]

  return (size: number): string => {
    for (const formatter of formatters) {
      if (size < UNIT_SWITCH_THRESHOLD || formatter === lastFormatter) {
        return formatter.format(size)
      }
      size /= K
    }
    throw new Error('should not happen')
  }
}
