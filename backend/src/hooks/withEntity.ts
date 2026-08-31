import type { HookContext } from '../declarations'
import { SkipAccessControl } from '../services/access/hooks'
import { ServiceName } from '../services/access/access.schema'
import { ServiceEntity, ServiceParams } from '../services/access/types'

export function withEntity<N extends ServiceName, Result>(serviceName: N, params: null | ServiceParams<N>, callback: (entity: ServiceEntity<N>) => Result) {
  return async ({ app, id }: HookContext) => {
    if (!id) {
      throw new Error('ID is required')
    }
    const service = app.service(serviceName)
    const entity = await service.get(id, { ...params as any, [SkipAccessControl]: true }) as ServiceEntity<N>
    return callback(entity)
  }
}
