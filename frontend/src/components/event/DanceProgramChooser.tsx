import React from 'react'

import { Workshop } from 'types'

import { FieldComponentProps } from 'libraries/forms'
import { DanceChooser, type DanceChooserItem } from 'components/widgets/DanceChooser'
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
    onChange={(dance) => onChange(getValue(value, dance, workshops))}
    allowEmpty
    emptyText={t('programTypes.RequestedDance')}
    workshops={workshops}
    chosenDancesIds={chosenDanceIds}
    {...props}
  />
})

function getValue(
  originalValue: EventProgramRow | IntervalMusic | null,
  dance: DanceChooserItem | null,
  workshops: Workshop[],
): EventProgramRow | IntervalMusic {
  const danceId = dance?._id ?? null

  if (!originalValue) {
    throw new Error('Original value is null. This should not happen.')
  }
  if ('type' in originalValue) {
    return {
      ...originalValue,
      type: dance ? 'Dance' : 'RequestedDance',
      eventProgram: null,
      dance: addWorkshops(dance, workshops),
      danceId,
    }
  }
  return {
    ...originalValue,
    dance: dance,
    danceId,
  }
}

function addWorkshops(
  dance: DanceChooserItem | null,
  workshops: Workshop[],
): EventProgramRow['dance'] | null {
  if (!dance) return null

  const teachedIn = workshops.map(workshop => {
    const instancesWithDance = workshop.instanceSpecificDances
      ? workshop.instances.filter(instance => instance.dances?.map(({ _id }) => _id).includes(dance._id))
      : null
    if (instancesWithDance?.length === 0) return null
    const danceInAllInstances = instancesWithDance?.length === workshop.instances.length

    return {
      _id: `${dance._id}-${workshop._id}`,
      workshop,
      instances: danceInAllInstances ? null : instancesWithDance,
    }
  }).filter(workshop => workshop !== null)

  return {
    ...dance,
    teachedIn,
  }
}
