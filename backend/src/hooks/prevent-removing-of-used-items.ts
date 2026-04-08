// For more information about this file see https://dove.feathersjs.com/guides/cli/hook.html
import { Conflict } from '@feathersjs/errors'
import type { HookContext } from '../declarations'
import { isUsedBySomething } from '../internal-services/dependencies'

export const preventRemovingOfUsedItems = async (context: HookContext) => {
  const { id, path } = context
  if (id !== undefined && isUsedBySomething(path, id)) {
    throw new Conflict('The item you tried to delete is still in use')
  }
}
