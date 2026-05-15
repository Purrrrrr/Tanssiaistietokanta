import type { HookContext } from '../declarations'
import { memoize } from 'es-toolkit'
import { loadDependencyTypes } from '../internal-services/dependencyRelations'
import { SkipAccessControl } from '../services/access/hooks'

const getReferencedByRelations = memoize((serviceName: string) => loadDependencyTypes(serviceName))

export const checkReferenceIntegrity = async (context: HookContext) => {
  const { path, data } = context

  if (!['create', 'update', 'patch'].includes(context.method)) return

  const referencedByRelations = getReferencedByRelations(path)
  for (const relation of referencedByRelations) {
    const linkedIds = await relation.getLinkedIds(data)
    await Promise.all(linkedIds.map(async linkedId => {
      if (linkedId == null) return
      await context.app.service(relation.service as any)
        .get(linkedId, { [SkipAccessControl]: true, query: { $select: ['_id'] } })
    }))
  }
}
