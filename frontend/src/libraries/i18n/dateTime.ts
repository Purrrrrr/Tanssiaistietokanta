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

export function useFormatDuration() {
  const formatter = new Intl.DurationFormat(locale, { style: 'long' })

  return (seconds: number) => formatter.format(toAproximateDuration(seconds))
}

const timeUnits = [
  { name: 'seconds', max: 60 },
  { name: 'minutes', max: 60 },
  { name: 'hours', max: 24 },
  { name: 'days', max: Infinity },
] as const

type DurationUnit = (typeof timeUnits)[number]['name']

function toAproximateDuration(seconds: number): Intl.DurationInput {
  const unitValues: [DurationUnit, number][] = []
  let value = Math.round(seconds)

  for (const unit of timeUnits) {
    const unitValue = value % unit.max
    unitValues.push([unit.name, unitValue])

    value = (value - unitValue) / unit.max

    if (value == 0) break
  }
  // If some units are not shown and the value of the last unshown unit is
  // over the unit's halfpoint, add one to the next unit to implement proper rounding
  if (unitValues.length > 2) {
    const roundIndex = unitValues.length - 3
    const max = timeUnits[roundIndex].max
    const roundValue = unitValues[roundIndex][1]
    if ((roundValue << 1) >= max) {
      unitValues[roundIndex + 1][1] += 1
    }
  }

  return Object.fromEntries(unitValues.slice(-2))
}
