import React from 'react'

import { Dance } from 'types'

import { FieldComponentProps } from 'libraries/forms'
import { DanceChooser } from 'components/widgets/DanceChooser'
import { useT } from 'i18n'

import { EventProgramRow, IntervalMusic } from './EventProgramForm'
import { useChosenDanceIds, useWorkshops } from './EventProgramForm/eventMetadata'

type DanceProgramChooserProps = FieldComponentProps<EventProgramRow | IntervalMusic>

export const DanceProgramChooser = React.memo(function DanceProgramChooser({ value, onChange, ...props }: DanceProgramChooserProps) {
  const t = useT('components.eventProgramEditor')
  const workshops = useWorkshops()
  const chosenDanceIds = useChosenDanceIds()
  const dance = value?.dance ?? null

  return <DanceChooser
    key={dance?._id ?? ''}
    value={dance}
    onChange={(dance) => onChange(getValue(value, dance as Dance | null))}
    allowEmpty
    emptyText={t('programTypes.RequestedDance')}
    workshops={workshops}
    chosenDancesIds={chosenDanceIds}
    {...props}
  />
})

function getValue(originalValue: EventProgramRow | IntervalMusic | null, dance: Dance | null): EventProgramRow | IntervalMusic {
  const dancePart = {
    dance: dance as EventProgramRow['dance'],
    danceId: dance?._id ?? null,
  }

  if (!originalValue) {
    throw new Error('Original value is null. This should not happen.')
  }
  if (originalValue && 'type' in originalValue) {
    return {
      ...originalValue,
      ...dancePart,
      type: dance ? 'Dance' : 'RequestedDance',
      eventProgram: null,
    }
  }
  return {
    ...originalValue,
    ...dancePart,
  }
}
