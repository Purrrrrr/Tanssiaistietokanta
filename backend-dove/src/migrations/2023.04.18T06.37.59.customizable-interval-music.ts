import updateDatabase from '../utils/updateDatabase';
import * as L from 'partial.lenses';
import R from 'ramda';
import { MigrationFn } from '../umzug.context';

export const up: MigrationFn = async params => {
  const eventsDb = params.context.getModel('events')

  await updateDatabase(eventsDb, R.compose(
    L.modify(
      ['program', 'danceSets', L.elems],
      ({intervalMusicDuration, intervalMusicSlideStyleId, ...rest}: any) => ({
        ...rest,
        intervalMusic: intervalMusicDuration ? {
          name: null,
          description: null,
          duration: intervalMusicDuration,
          slideStyleId: intervalMusicSlideStyleId ?? null,
        } : null,
      })
    ),
    L.set(
      ['program', 'defaultIntervalMusic'],
      {
        name: null,
        description: null,
        duration: 15*60,
        slideStyleId: null,
      }
    )
  ))
}

export const down: MigrationFn = async () => {};
