const locale = 'FI-fi'

export function useFormatDate() {
  const formatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
  })

  return formatter.format
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

  return formatter.format
}
export function useFormatTime() {
  const formatter = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: undefined,
  })

  return (date: Date) => `klo ${formatter.format(date)}`
}
