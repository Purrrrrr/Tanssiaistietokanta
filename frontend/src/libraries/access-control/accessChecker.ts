import { RightQuery, RightsQuery, ServiceName, ServiceRight } from './types'

import { RightsQueryFunction } from './context'

export function resolveRightsQuery(rightsFn: RightsQueryFunction, query: RightsQuery): Promise<boolean[]> {
  const parsedRights = parseRightsQuery(query)
  return Promise.all(parsedRights.map(rightsFn))
}

export function parseRightsQuery({ rights, context, contextId, entityId, owner, owningId }: RightsQuery): RightQuery<ServiceName>[] {
  const rightsList = Array.isArray(rights) ? rights : [rights]

  return rightsList.flatMap((right) => {
    const [service, rightsPart] = right.split(':') as [ServiceName, string]
    const rights = rightsPart.split(',') as ServiceRight<ServiceName>[]
    return rights.map(right => {
      // Apply the defaulting logic for context and owner based on the query parameters
      // If context is provided and matches the service
      // => use contextId as entityId if it is not explicitly provided
      // If context is provided and does not match the service
      // => use context as owner and contextId as owningId if it is not explicitly provided
      return {
        service,
        right,
        entityId: entityId ?? (context === service ? contextId : undefined),
        owner: owner ?? (context !== service ? context : undefined),
        owningId: owningId ?? (context !== service ? contextId : undefined),
      }
    })
  })
}
