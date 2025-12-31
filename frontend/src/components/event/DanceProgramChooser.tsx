import React from 'react'

import { Dance } from 'types'

import { FieldComponentProps } from 'libraries/forms'
import { DanceProgram, EventProgramItem, RequestedDance } from 'components/event/EventProgramForm'
import { DanceChooser } from 'components/widgets/DanceChooser'
import { useT } from 'i18n'

import { useChosenDanceIds, useWorkshops } from './EventProgramForm/eventMetadata'

type DanceProgramChooserProps = FieldComponentProps<EventProgramItem>

export const DanceProgramChooser = React.memo(function DanceProgramChooser({ value, onChange, ...props }: DanceProgramChooserProps) {
  const t = useT('components.eventProgramEditor')
  const workshops = useWorkshops()
  const chosenDanceIds = useChosenDanceIds()
  return <DanceChooser
    key={value?._id}
    value={value?._id ? value as Dance : null}
    onChange={(dance) => onChange(
      dance
        ? { ...dance, __typename: 'Dance' } as DanceProgram
        : { __typename: 'RequestedDance' } as RequestedDance,
    )}
    allowEmpty
    emptyText={t('programTypes.RequestedDance')}
    workshops={workshops}
    chosenDancesIds={chosenDanceIds}
    {...props}
  />
})
