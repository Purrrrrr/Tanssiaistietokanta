import {merge as merge3} from 'node-diff3'

import {MergeData, PartialMergeResult, scalarConflict} from '../types'

const wordBoundary = (() => {
  try {
    return /(?<=\p{White_Space}+)(?!\p{White_Space}+)|(?<!\p{White_Space}+)(?=\p{White_Space}+)/u
    // eslint-disable-next-line no-unreachable
  } catch(_ignored) {
    return /\b/
  }
})()

export function mergeConflictingStrings(
  data : MergeData<string>
) : PartialMergeResult<string> {
  const {server, original, local} = data
  const { conflict, result } = merge3(server, original, local, {stringSeparator: wordBoundary})

  if (!conflict) {
    const value = result.join('')
    return {
      state: 'MODIFIED_LOCALLY',
      modifications: value,
      nonConflictingModifications: value,
      conflicts: [],
    }
  }

  return {
    state: 'CONFLICT',
    modifications: local,
    nonConflictingModifications: server,
    conflicts: [scalarConflict(data)],
  }
}
