import { DateLike, useFormatCompactDateTime, useFormatDateTime } from '@/libraries/i18n/dateTime'

import { TooltipContainer } from './TooltipContainer'

export function useDisplayTimestamp() {
  const formatDate = useFormatCompactDateTime()
  const formatFullDate = useFormatDateTime()

  return (timestamp: DateLike) => {
    return <TooltipContainer tooltip={formatFullDate(timestamp)}>
      {props => <time {...props}>{formatDate(timestamp)}</time>}
    </TooltipContainer>
  }
}
