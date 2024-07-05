import { format } from 'date-fns'
import { fi } from 'date-fns/locale'

export const dateFormat = 'dd.MM.yyyy'
export const dateTimeFormat = 'eeeeee dd.MM.yyyy \'klo\' HH:mm'

export function useFormatDate() {
  return (date: Date) => format(date, dateFormat)
}
export function useFormatDateTime() {
  return (date: Date) => format(date, dateTimeFormat, {locale: fi})
}
