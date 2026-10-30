import React from 'react'

import { Dance, Workshop } from '@/types'
import { FieldInputComponentProps } from '@/libraries/ui/form/inputs/types'

import { DanceChooser, type DanceChooserItem } from '@/components/widgets/DanceChooser'
import { useT } from '@/i18n'

import { EventProgramRow } from './EventProgramForm'
import { useChosenDanceIds, useWorkshops } from './EventProgramForm/eventMetadata'

type DanceProgramChooserProps = FieldInputComponentProps<EventProgramRow>

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
  originalValue: EventProgramRow | null | undefined,
  dance: DanceChooserItem | null,
  workshops: Workshop[],
): EventProgramRow {
  if (!originalValue) {
    throw new Error('Original value is null. This should not happen.')
  }
  return {
    ...originalValue,
    type: dance ? 'Dance' : 'RequestedDance',
    eventProgram: null,
    dance: addWorkshops(dance, workshops),
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
      __typename: 'TeachedInWorkshop' as const,
      _id: `${dance._id}-${workshop._id}`,
      workshop,
      instances: danceInAllInstances ? null : instancesWithDance,
    }
  }).filter(workshop => workshop !== null)

  return {
    ...dance as Dance,
    __typename: 'Dance',
    teachedIn,
  } as EventProgramRow['dance'] // A bit of a hack to make the type system happy. TODO: fix somehow
}
