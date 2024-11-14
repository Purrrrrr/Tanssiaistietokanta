import { EventProgram, EventSlideProps } from './types'

export function useEventSlides(program?: EventProgram): EventSlideProps[] {
  if (!program) return []
  return [
    { id: '', type: 'title' },
    ...program.introductions.program.map((item, idx) => ({
      id: item._id,
      type: 'introduction',
      parentId: '',
      itemIndex: idx
    } as const)),
    ...program.danceSets.flatMap((danceSet, danceSetIndex) => [
      {
        id: danceSet._id,
        type: 'danceSet',
        danceSetIndex,
      } as const,
      ...danceSet.program.map((item, idx) => ({
        id: item._id,
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
              type: 'intervalMusic',
              parentId: danceSet._id,
              danceSetIndex,
            } as const
          ]
          : []
      )
    ]),
  ]
}

export function intervalMusicId(danceSetId: string): string {
  return `${danceSetId}-intervalMusic`
}
