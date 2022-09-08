import {merge as merge3} from 'node-diff3'
import {MergeData, MergeResult} from './types'

export function mergeConflictingStrings(
  {server, original, local, key} : MergeData<string>
) : MergeResult<string> {
  const { conflict, result } = merge3(server, original, local, {stringSeparator: "\n"})
  
  if (!conflict) {
    return {
      state: 'MODIFIED_LOCALLY',
      pendingModifications: result.join("\n"),
      conflicts: [],
    }
  }

  return {
    state: 'CONFLICT',
    pendingModifications: local,
    conflicts: [key],
  }
}
