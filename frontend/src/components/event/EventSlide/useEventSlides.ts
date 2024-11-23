import { useMemo } from 'react'

import { useTranslation } from 'i18n'

import { EventProgram, EventProgramRow, EventSlideProps } from './types'

export const startSlideId = ''

export function useEventSlides(program?: EventProgram): EventSlideProps[] {
  const programItemTitle = useProgramItemTitle()
  const intervalMusicTitle = useTranslation('components.eventProgramEditor.programTypes.IntervalMusic')

  return useMemo(
    () => program ? [
      { id: startSlideId, type: 'title', title: program.introductions.title },
      ...program.introductions.program.map((item, idx) => ({
        id: item._id,
        title: programItemTitle(item),
        type: 'introduction',
        parentId: startSlideId,
        itemIndex: idx
      } as const)),
      ...program.danceSets.flatMap((danceSet, danceSetIndex) => [
        {
          id: danceSet._id,
          title: danceSet.title,
          type: 'danceSet',
          danceSetIndex,
        } as const,
        ...danceSet.program.map((item, idx) => ({
          id: item._id,
          title: programItemTitle(item),
          type: 'programItem',
          parentId: danceSet._id,
          danceSetIndex,
          itemIndex: idx,
        } as const)),
        ...(
          danceSet.intervalMusic
            ? [
              {
                id: intervalMusicId(danceSet._id),
                title: danceSet.intervalMusic.name || program.defaultIntervalMusic.name || intervalMusicTitle,
                type: 'intervalMusic',
                parentId: danceSet._id,
                danceSetIndex,
              } as const
            ]
            : []
        )
      ]),
    ] : [],
    [program, intervalMusicTitle, programItemTitle]
  )
}

function useProgramItemTitle() {
  const requestedDanceTitle = useTranslation('components.eventProgramEditor.programTypes.RequestedDance')

  return (item: EventProgramRow) => item.item.__typename === 'RequestedDance'
    ? requestedDanceTitle
    : item.item.name ?? ''
}

export function intervalMusicId(danceSetId: string): string {
  return `${danceSetId}-intervalMusic`
}
