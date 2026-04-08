// For more information about this file see https://dove.feathersjs.com/guides/cli/hook.html
import type { HookContext } from '../declarations'
import { getDependencyLinks } from '../internal-services/dependencies'
import { SkipAccessControl } from '../services/access/hooks'

export const deleteOrphans = async (context: HookContext) => {
  const results = Array.isArray(context.result)
    ? context.result
    : context.result ? [context.result] : []

  for (const item of results) {
    const childLinks = getDependencyLinks(context.path, item._id, 'parentOf')
    for (const [childService, childIds] of childLinks) {
      for (const childId of childIds) {
        await context.app.service(childService as any).remove(childId, { [SkipAccessControl]: true })
      }
    }
  }
}
