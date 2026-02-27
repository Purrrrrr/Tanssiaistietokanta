import { useEffect, useMemo, useRef, useState } from 'react'

import { ID, RightQuery, RightQueryContext, RightsQuery, ServiceName, ServiceRight, SingleRightQueryString } from './types'

import { useRightsQueryFn } from './context'
import { replaceEqualDeep } from './utils'

const PENDING_RESULT = [false]

export function useRight(right: SingleRightQueryString, context?: RightQueryContext): boolean {
  return useRights(right, context).every(Boolean)
}

export function useRights(rights: RightsList, context?: RightQueryContext): boolean[] {
  const queryFn = useRightsQueryFn()
  const parsedRights = useParsedRights({ rights, ...context })

  const idRef = useRef(0)
  const [result, setResult] = useState(PENDING_RESULT)
  useEffect(() => {
    const id = idRef.current
    Promise.all(parsedRights.map(queryFn)).then(newestResult => {
      if (id !== idRef.current) return
      setResult(newestResult)
    })
  }, [parsedRights, queryFn])

  return result
}

type RightsList = RightsQuery['rights']

function useParsedRights({ rights, context, contextId, entityId, owner, ownerId }: RightsQuery): RightQuery<ServiceName>[] {
  const stableRights = useStableRightsProp(rights)

  return useMemo(() => {
    const rightsList = Array.isArray(stableRights) ? stableRights : [stableRights]

    return rightsList.flatMap((right) => {
      const [service, rightsPart] = right.split(':') as [ServiceName, string]
      const rights = rightsPart.split(',') as ServiceRight<ServiceName>[]
      return rights.map(right => {
        // Apply the defaulting logic for context and owner based on the query parameters
        // If context is provided and matches the service
        // => use contextId as entityId if it is not explicitly provided
        // If context is provided and does not match the service
        // => use context as owner and contextId as ownerId if it is not explicitly provided
        return {
          service,
          right,
          entityId: entityId ?? (context === service ? contextId : undefined),
          owner: owner ?? (context !== service ? context : undefined),
          ownerId: ownerId ?? (context !== service ? contextId : undefined),
        }
      })
    })
  }, [stableRights, context, contextId, entityId, owner, ownerId])
}

function useStableRightsProp(rights: RightsList): RightsList {
  const [previous, setPrevious] = useState(rights)

  const replaced = replaceEqualDeep(previous, rights)
  if (replaced !== previous) {
    setPrevious(replaced)
  }

  return previous
}
