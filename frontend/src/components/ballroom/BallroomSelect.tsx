import { Ballroom } from 'types'

import { formatBallroom, useBallrooms } from 'services/ballrooms'

import { FieldComponentProps } from 'libraries/forms'
import { Select } from 'libraries/formsV2/components/inputs'
import { useTranslation } from 'i18n'

export function BallroomSelect({ value, readOnly, ...props }: FieldComponentProps<Ballroom | null>) {
  const [ballrooms] = useBallrooms()
  const emptyText = useTranslation('common.choose')
  const itemToString = (ballroom: Ballroom | null) => ballroom
    ? formatBallroom(ballroom)
    : emptyText

  if (readOnly) {
    if (!value) return null
    return <span>{itemToString(value)}</span>
  }

  return <Select<Ballroom | null>
    value={value ?? null}
    items={ballrooms}
    itemToString={itemToString}
    {...props}
  />
}
