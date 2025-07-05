const locale = 'FI-fi'

export type DateLike = Date | number | string

export function useFormatDate() {
  const formatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
  })

  return (date: DateLike) => formatter.format(toDate(date))
}
export function useFormatDateTime() {
  const formatter = new Intl.DateTimeFormat('fi', {
    weekday: 'short',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  })

  return (date: DateLike) => formatter.format(toDate(date))
}
export function useFormatTime() {
  const formatter = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: undefined,
  })

  return (date: DateLike) => `klo ${formatter.format(toDate(date))}`
}

const toDate = (date: DateLike) => date instanceof Date ? date : new Date(date)
