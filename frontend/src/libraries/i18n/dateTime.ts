import { format } from 'date-fns'

export const dateFormat = 'dd.MM.yyyy'
export const dateTimeFormat = 'dd.MM.yyyy HH:mm'

export function useFormatDate() {
  return (date: Date) => format(date, dateFormat)
}
export function useFormatDateTime() {
  return (date: Date) => format(date, dateTimeFormat)
}
