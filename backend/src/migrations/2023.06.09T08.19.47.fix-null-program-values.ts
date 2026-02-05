import * as L from 'partial.lenses'
import R from 'ramda'
import { MigrationFn } from '../umzug.context'

export const up: MigrationFn = async params => {
  await params.context.updateDatabase('events', L.modify(
    [
      'program', 'danceSets', L.elems,
      'program', L.elems, 'eventProgram', L.when(R.isNotNil),
    ],
    R.compose(
      L.set(['duration', L.when(R.isNil)], 0),
      L.set(['description', L.when(R.isNil)], ''),
    ),
  ))
}

export const down: MigrationFn = async () => {}
