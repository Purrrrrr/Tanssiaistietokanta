import * as L from 'partial.lenses'
import {createPatch} from 'rfc6902'

import {PatchStrategy, patchStrategy} from 'libraries/forms'
import {removeTypenames} from 'utils/removeTypenames'

import {EventProgramRow, EventProgramSettings} from './types'

export type JSONPatch = unknown[]

export const patch : PatchStrategy<EventProgramSettings, JSONPatch> = function patch(original, modifications, conflicts) {
  const result = patchStrategy.noPatch(original, modifications, conflicts)

  if (!result.hasModifications) return { hasModifications: false }

  const { hasModifications, newServerState, patch } = result

  return {
    hasModifications,
    newServerState,
    patch: createPatch(toProgramInput(original), toProgramInput(patch)) as JSONPatch,
  }
}

function toProgramInput({introductions, danceSets, ...rest} : EventProgramSettings) {
  return removeTypenames({
    introductions: L.modify(
      ['program', L.elems], toProgramItemInput, introductions
    ),
    danceSets: L.modify(
      [L.elems, 'program', L.elems], toProgramItemInput, danceSets
    ),
    ...rest,
  })
}

function toProgramItemInput(row : EventProgramRow) {
  const {_id, slideStyleId, item} = row
  if (item === undefined) console.log(row)
  const {__typename, ...restItem} = item
  const commonProps = {_id, slideStyleId, type: __typename}
  switch(__typename) {
    case 'Dance':
      return {
        ...commonProps,
        dance: item._id
      }
    case 'RequestedDance':
      return commonProps
    case 'EventProgram':
      return {
        ...commonProps,
        eventProgram: restItem,
      }
    default:
      throw new Error('Unexpected program item type '+__typename)
  }
}
