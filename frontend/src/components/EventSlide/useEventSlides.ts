import { EventProgram, EventSlideProps } from './types'

export function useEventSlides(program: EventProgram): EventSlideProps[] {
  return [
    { id: '', type: 'title' },
    ...program.introductions.program.map((item, idx) => ({
      id: item._id,
      type: 'introduction',
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
        danceSetIndex,
        itemIndex: idx,
      } as const)),
      ...(
        danceSet.intervalMusic
          ? [
            {
              id: intervalMusicId(danceSet._id),
              type: 'intervalMusic',
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
