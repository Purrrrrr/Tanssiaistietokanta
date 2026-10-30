import { Ballroom } from '@/types'
import { FieldInputComponentProps, Nullable } from '@/libraries/ui/form/inputs/types'

import { formatBallroom, useBallrooms } from '@/services/ballrooms'

import { Select } from '@/libraries/formsV2/components/inputs'
import { useTranslation } from '@/i18n'

type MinimalBallroom = Pick<Ballroom, '_id'>

export function BallroomSelect({ value, readOnly, ...props }: FieldInputComponentProps<Nullable<Ballroom>, Nullable<MinimalBallroom>>) {
  const [ballrooms] = useBallrooms()
  const emptyText = useTranslation('common.choose')
  const itemToString = (ballroom: Ballroom | null) => ballroom
    ? formatBallroom(ballroom)
    : emptyText
  const fullValue = ballrooms.find(b => b._id === value?._id) ?? null

  if (readOnly) {
    if (!value) return null
    return <span>{itemToString(fullValue)}</span>
  }

  return <Select<Ballroom | null>
    value={fullValue ?? null}
    items={ballrooms}
    itemToString={itemToString}
    {...props}
  />
}
