import updateDatabase from '../utils/updateDatabase';
import * as L from 'partial.lenses';
import R from 'ramda';
import { MigrationFn } from '../umzug.context';

export const up: MigrationFn = async params => {
  const eventsDb = params.context.getModel('events')

  const whenUndefined = L.when(R.equals(undefined))

  await updateDatabase(eventsDb, R.compose(
    L.modify(
      ['program', 'danceSets', L.elems],
      (danceSet: any) => ({
        titleSlideStyleId: null,
        ...danceSet,
        program: L.set(
          [L.elems, 'slideStyleId', whenUndefined],
          null,
          danceSet.program,
        )
      })
    ),
    L.set(
      ['program', 'introductions', 'titleSlideStyleId', whenUndefined],
      null,
    ),
    L.set(
      ['program', 'introductions', 'title', whenUndefined],
      null,
    ),
    L.set(
      ['program', 'slideStyleId', whenUndefined],
      null,
    ),
  ))
}

export const down: MigrationFn = async () => {};
