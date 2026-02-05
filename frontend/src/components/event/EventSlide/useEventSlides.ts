import { useMemo } from 'react'

import { EventParentSlideProps, EventProgram, EventProgramRow, EventSlideProps } from './types'

import { useT, useTranslation } from 'i18n'

import { getProgramName } from '../utils'

export const startSlideId = ''

export function useEventSlides(program?: EventProgram): EventSlideProps[] {
  const programItemTitle = useProgramRowTitle()
  const defaultIntervalMusicTitle = useTranslation('components.eventProgramEditor.programTypes.IntervalMusic')

  return useMemo(
    () => program ?
      addNextLinks(flatten([
        {
          id: startSlideId,
          type: 'title',
          title: program.introductions.title,
          children: program.introductions.program.map((row, idx) => ({
            id: row._id,
            title: programItemTitle(row),
            type: 'introduction',
            parentId: startSlideId,
            itemIndex: idx,
          } as const)),
        },
        ...program.danceSets.map((danceSet, danceSetIndex) => ({
          id: danceSet._id,
          title: danceSet.title,
          type: 'danceSet' as const,
          danceSetIndex,
          children: [
            ...danceSet.program.map((row, idx) => ({
              id: row._id,
              title: programItemTitle(row),
              type: 'programItem',
              parentId: danceSet._id,
              danceSetIndex,
              itemIndex: idx,
              showInLists: row.type !== 'EventProgram' || row.eventProgram?.showInLists !== false,
            } as const)),
            ...(
              danceSet.intervalMusic
                ? [
                  {
                    id: intervalMusicId(danceSet._id),
                    title: (danceSet.intervalMusic.name ?? program.defaultIntervalMusic.name) ?? defaultIntervalMusicTitle,
                    type: 'intervalMusic' as const,
                    parentId: danceSet._id,
                    danceSetIndex,
                    showInLists: danceSet.intervalMusic.showInLists ?? program.defaultIntervalMusic.showInLists ?? false,
                  },
                ]
                : []
            ),
          ],
        })),
      ]))
      : [],
    [program, defaultIntervalMusicTitle, programItemTitle],
  )
}

function flatten(parentSlides: EventParentSlideProps[]): EventSlideProps[] {
  return parentSlides.flatMap(parent => {
    parent.children.forEach(child => child.parent = parent)
    return [
      parent,
      ...parent.children,
    ]
  })
}

function addNextLinks(slides: EventSlideProps[]): EventSlideProps[] {
  for (let i = 1; i < slides.length; i++) {
    slides[i - 1].next = slides[i]
  }
  return slides
}

function useProgramRowTitle() {
  const T = useT('components.eventProgramEditor')

  return (row: EventProgramRow) => getProgramName(row, T)
}

function intervalMusicId(danceSetId: string): string {
  return `${danceSetId}-intervalMusic`
}
