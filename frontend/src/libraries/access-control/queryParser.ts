import { RightQueryString, ServiceName, ServiceRight, ServiceRightQuery, ServiceRightsEntity } from './types'

export function parseRightQueryString<Service extends ServiceName>(query: RightQueryString<Service> | RightQueryString<Service>[], entity?: ServiceRightsEntity<Service>): ServiceRightQuery<Service>[] {
  if (Array.isArray(query)) {
    return query.flatMap((q: RightQueryString<Service>) => parseRightQueryString(q, entity))
  }
  const [service, rightsPart] = query.split(':') as [Service, string]
  const rights = rightsPart.split(',') as ServiceRight<Service>[]
  return rights.map(right => ({ service, entity, right }))
}
