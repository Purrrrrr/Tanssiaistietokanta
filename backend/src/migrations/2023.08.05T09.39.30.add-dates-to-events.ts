import * as L from 'partial.lenses';
import R from 'ramda';
import { MigrationFn } from '../umzug.context';

export const up: MigrationFn = async params => {
  await params.context.updateDatabase('events', 
    R.compose(
      L.set(
        'beginDate',
        '0000-01-01'
      ),
      L.set(
        'endDate',
        '0000-01-01'
      )
    )
  )
}

export const down: MigrationFn = async () => {};
