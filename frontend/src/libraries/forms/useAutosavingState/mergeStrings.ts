import {merge as merge3} from 'node-diff3'

import {conflictingScalarChange, MergeData, MergeResult, scalarChange} from './types'

const wordBoundary = (() => {
  try {
    return /(?<=\p{White_Space}+)(?!\p{White_Space}+)|(?<!\p{White_Space}+)(?=\p{White_Space}+)/u
    // eslint-disable-next-line no-unreachable
  } catch(e) {
    return /\b/
  }
})()

export function mergeConflictingStrings(
  {server, original, local} : MergeData<string>
) : MergeResult<string> {
  const { conflict, result } = merge3(server, original, local, {stringSeparator: wordBoundary})

  if (!conflict) {
    const value = result.join()
    return {
      state: 'MODIFIED_LOCALLY',
      modifications: value,
      nonConflictingModifications: value,
      patch: [
        { op: 'replace', value, path: '' },
      ],
      //modifiedPaths: [[]],
      //conflictingPaths: [[]],
      conflicts: [],
      changes: scalarChange(value)
    }
  }

  return {
    state: 'CONFLICT',
    modifications: local,
    nonConflictingModifications: server,
    patch: [],
    //modifiedPaths: [[]],
    //conflictingPaths: [[]],
    conflicts: [[]],
    changes: conflictingScalarChange({server, local})
  }
}
