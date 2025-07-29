import * as L from 'partial.lenses';
import R from 'ramda';
import { MigrationFn } from '../umzug.context';

export const up: MigrationFn = async params => {
  await params.context.updateDatabase('events', 
    event => {
      const { endDate } = event as { endDate: string }
      const programDateTime = `${endDate}T20:00:00.000`

      return R.compose(
        L.set(['program', 'dateTime'], programDateTime),
        L.set(['program', 'danceSets', L.elems, 'intervalMusic', L.when(R.isNotNil), 'showInLists'], false),
        L.set(['program', 'defaultIntervalMusic', 'showInLists'], false),
      )(event)
    }
  )
}

export const down: MigrationFn = async () => {};
