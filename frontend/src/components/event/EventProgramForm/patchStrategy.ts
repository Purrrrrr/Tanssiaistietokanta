import * as L from 'partial.lenses'

import { EventProgramRow, EventProgramSettings } from './types'

import { cleanMetadataValues } from 'backend'

import { PatchStrategy, patchStrategy } from 'libraries/forms'
import { removeTypenames } from 'utils/removeTypenames'

export type JSONPatch = unknown[]

export const patch: PatchStrategy<EventProgramSettings, JSONPatch> = function patch(original, modified) {
  const originalAsInput = toProgramInput(original)
  const modifiedAsInput = toProgramInput(modified)

  return patchStrategy.jsonPatch(originalAsInput, modifiedAsInput)
}

function toProgramInput({ introductions, danceSets, ...rest }: EventProgramSettings) {
  return cleanMetadataValues(removeTypenames({
    introductions: L.modify(
      ['program', L.elems], toProgramItemInput, introductions,
    ),
    danceSets: L.modify(
      L.elems,
      compose(
        (danceSet) => (
          L.modify(['intervalMusic', L.when(val => val != null), 'dance'], (dance) => dance?._id, danceSet)
        ),
        L.modify(['program', L.elems], toProgramItemInput),
      ),
      danceSets,
    ),
    ...rest,
  }))
}

function compose(fun: (val: unknown) => unknown, fun2: (val: unknown) => unknown) {
  return (value: unknown) => fun2(fun(value))
}

function toProgramItemInput({ dance, ...row }: EventProgramRow) {
  return row
}
