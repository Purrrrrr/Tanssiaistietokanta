import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { RightQuery, RightQueryContext, RightsQuery, ServiceName, SingleRightQueryString } from './types'

import { parseRightsQuery, resolveRightsQuery } from './accessChecker'
import { useRightsContext } from './context'
import { replaceEqualDeep } from './utils'

export function useHasRights() {
  const { hasRight } = useRightsContext()
  return useCallback(
    (query: RightsQuery) => resolveRightsQuery(hasRight, query),
    [hasRight],
  )
}

export function useRight(right: SingleRightQueryString, context?: RightQueryContext): boolean {
  return useRights(right, context).every(Boolean)
}

export function useRights(rights: RightsList, context?: RightQueryContext): boolean[] {
  const { hasRight, hasCachedRight, subscribe } = useRightsContext()
  const parsedRights = useParsedRights({ rights, ...context })

  const idRef = useRef(0)
  const [result, setResult] = useState(() => {
    return parsedRights.map(hasCachedRight)
  })

  useEffect(() => {
    const loadRightsResult = () => {
      if (parsedRights.every(r => r !== undefined)) {
        return
      }
      idRef.current += 1
      const id = idRef.current
      Promise.all(parsedRights.map(hasRight)).then(newestResult => {
        if (id !== idRef.current) return
        setResult(newestResult)
      })
    }

    loadRightsResult()
    return subscribe(loadRightsResult)
  }, [parsedRights, hasRight, subscribe])

  return result.map(r => r === true)
}

type RightsList = RightsQuery['rights']

function useParsedRights({ rights, context, contextId, entityId, owner, owningId }: RightsQuery): RightQuery<ServiceName>[] {
  const stableRights = useStableRightsProp(rights)

  return useMemo(() => {
    return parseRightsQuery({
      rights: stableRights,
      context,
      contextId,
      entityId,
      owner,
      owningId,
    })
  }, [stableRights, context, contextId, entityId, owner, owningId])
}

function useStableRightsProp(rights: RightsList): RightsList {
  const [previous, setPrevious] = useState(rights)

  const replaced = replaceEqualDeep(previous, rights)
  if (replaced !== previous) {
    setPrevious(replaced)
  }

  return previous
}
