import { DateLike, useFormatCompactDateTime, useFormatDateTime } from 'libraries/i18n/dateTime'

import { TooltipContainer } from './Button'

export function useDisplayTimestamp() {
  const formatDate = useFormatCompactDateTime()
  const formatFullDate = useFormatDateTime()

  return (timestamp: DateLike) => {
    return <TooltipContainer tooltip={formatFullDate(timestamp)}><time>{formatDate(timestamp)}</time></TooltipContainer>
  }
}
