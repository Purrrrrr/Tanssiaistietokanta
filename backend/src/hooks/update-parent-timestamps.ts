import { memoize } from 'es-toolkit'

import type { HookContext } from '../declarations'
import { loadDependencyTypes } from '../internal-services/dependencyRelations'
import { SkipAccessControl } from '../services/access/hooks'

const getChildOfRelations = memoize((serviceName: string) =>
  loadDependencyTypes(serviceName).filter(dep => dep.type === 'childOf'),
)

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export const updateParentTimestamps = async (context: HookContext) => {
  if (!['create', 'update', 'patch', 'remove'].includes(context.method)) return
  const childOfRelations = getChildOfRelations(context.path)
  if (childOfRelations.length === 0) return

  const results = Array.isArray(context.result)
    ? context.result
    : context.result ? [context.result] : []
  if (results.length === 0) return

  const fieldName = `_child${capitalize(context.path)}UpdatedAt`
  const timestamp = new Date().toISOString()

  for (const relation of childOfRelations) {
    const parentIds = new Set<string>()
    for (const item of results) {
      const ids = await relation.getLinkedIds(item)
      for (const id of ids) {
        if (id != null) parentIds.add(String(id))
      }
    }

    await Promise.all(
      [...parentIds].map(parentId =>
        context.app.service(relation.service as any).patch(
          parentId,
          { [fieldName]: timestamp },
          { [SkipAccessControl]: true },
        ),
      ),
    )
  }
}
