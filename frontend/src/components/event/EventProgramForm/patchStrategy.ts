import * as L from 'partial.lenses'

import {PatchStrategy, patchStrategy} from 'libraries/forms'
import {removeTypenames} from 'utils/removeTypenames'

import {EventProgramRow, EventProgramSettings} from './types'

export type JSONPatch = unknown[]

export const patch : PatchStrategy<EventProgramSettings, JSONPatch> = function patch(original, modified) {
  const originalAsInput = toProgramInput(original)
  const modifiedAsInput = toProgramInput(modified)

  return patchStrategy.jsonPatch(originalAsInput, modifiedAsInput)
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
