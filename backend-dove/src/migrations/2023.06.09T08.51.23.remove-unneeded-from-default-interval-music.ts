import * as L from 'partial.lenses';
import R from 'ramda';
import { MigrationFn } from '../umzug.context';

export const up: MigrationFn = async params => {
  await params.context.updateDatabase('events', L.modify(
    [
      'program', 'defaultIntervalMusic', 
    ],
    R.omit(['duration', 'slideStyleId'])
  ))
}

export const down: MigrationFn = async () => {};
