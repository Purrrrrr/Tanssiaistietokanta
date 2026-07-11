import type { HookContext } from '../declarations'
import { SkipAccessControl } from '../services/access/hooks'
import { ServiceName } from '../services/access/access.schema'
import { ServiceEntity, ServiceParams } from '../services/access/types'

export function withEntity<N extends ServiceName, Result>(serviceName: N, params: null | ServiceParams<N>, callback: (entity: ServiceEntity<N>) => Result) {
  const select = params?.query?.$select
  return async ({ app, id }: HookContext) => {
    if (!id) {
      throw new Error('ID is required')
    }
    const service = app.service(serviceName)

    if (params?.query?.$select && select) {
      // The version of feathers adapter-commons that feathers-nedb uses has a bug that causes it to mutate the $select array, so we need to make a copy of it
      params.query.$select = select.slice()
    }
    const entity = await service.get(id, { ...params as any, [SkipAccessControl]: true }) as ServiceEntity<N>
    return callback(entity)
  }
}
