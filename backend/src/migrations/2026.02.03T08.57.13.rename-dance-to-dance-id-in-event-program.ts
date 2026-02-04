import { omit } from 'ramda';
import { MigrationFn } from '../umzug.context';
import * as L from 'partial.lenses'

export const up: MigrationFn = async params => {
  params.context.updateDatabase('events', L.modify(
    ['program', 'danceSets', L.elems],
    ({ program, intervalMusic, ...rest }: any) => ({
      program: program.map(({ dance, ...rest }: any) => ({ danceId: dance, ...rest })),
      intervalMusic: intervalMusic
        ? { ...omit(['dance'], intervalMusic), danceId: intervalMusic.dance ?? null }
        : intervalMusic,
      ...rest,
    })
  ))
}
export const down: MigrationFn = async params => {}
