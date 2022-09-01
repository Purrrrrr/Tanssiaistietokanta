import deepEquals from 'fast-deep-equal'

export type VarType = 'array' | 'object' | 'string' | 'scalar' | 'null'
export type SyncState = 'IN_SYNC' | 'MODIFIED_LOCALLY' | 'CONFLICT'
export interface MergeResult<T> {
  state: SyncState
  serverState: T
  pendingModifications?: Partial<T>
  conflicts: string[]
}

export function merge<T>(serverValue: T, originalValue: T, localValue: Partial<T>, key : string) : MergeResult<T> {
  const modifiedLocally = localValue !== undefined || !deepEquals(originalValue, localValue)
  if (!modifiedLocally) {
    return {
      state: 'IN_SYNC',
      serverState: serverValue,
      conflicts: [],
    }
  }

  const modifiedOnServer = !deepEquals(originalValue, serverValue)
  const conflict = !deepEquals(serverValue, localValue)

  if (!modifiedOnServer) { //& modified locally
    return {
      state: 'MODIFIED_LOCALLY',
      serverState: serverValue,
      pendingModifications: localValue,
      conflicts: [],
    }
  }
  if (!conflict) { // Both have same modifications
    return {
      state: 'IN_SYNC',
      serverState: serverValue,
      conflicts: [],
    }
  }
  
  const [serverType, originalType, localType] = [serverValue, originalValue, localValue].map(typeOf)
  const typesMatch = serverType === localType && localType === originalType && originalType === serverType

  if (!typesMatch || originalType === 'scalar') {
    //Mismatch, cannot merge
    return {
      state: 'CONFLICT',
      serverState: serverValue,
      pendingModifications: localValue,
      conflicts: [key],
    }
  }

  switch(originalType) {
    case 'object':
      return mergeObjects(serverValue, originalValue, localValue, key)
    case 'string':
      return mergeStrings(serverValue as unknown as string, originalValue as unknown as string, localValue as unknown as string, key)
    case 'array':
      return mergeArrays(serverValue as unknown as any[], originalValue as unknown as any[], localValue as unknown as any[], key)
  }
  throw Error('should not happen')
}

function mergeObjects<T extends Object>(serverValue: T, originalValue: T, localValue: Partial<T>, key: string) : MergeResult<T> {
}
function mergeStrings(serverValue: string, originalValue: string, localValue: string, key: string) : MergeResult<any> {
}
function mergeArrays<T extends any[]>(serverValue: T, originalValue: T, localValue: Partial<T>, key: string) : MergeResult<any> {
}

function typeOf(value: any) : VarType {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  if (typeof value === 'object') return 'object'
  if (typeof value === 'string') return 'string'

  return 'scalar'
}
