import {merge as merge3} from 'node-diff3'
import {MergeData, MergeResult} from './types'

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
    return {
      state: 'MODIFIED_LOCALLY',
      pendingModifications: result.join(),
      conflicts: [],
    }
  }

  return {
    state: 'CONFLICT',
    pendingModifications: local,
    conflicts: [[]],
  }
}
