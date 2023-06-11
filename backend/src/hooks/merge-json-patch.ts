// For more information about this file see https://dove.feathersjs.com/guides/cli/hook.html
import type { HookContext } from '../declarations'
import type { NullableId, ServiceInterface } from '@feathersjs/feathers'
import { applyPatch, Operation } from 'fast-json-patch'

export const mergeJsonPatch = (cleanup?: (data: unknown) => unknown) => {
  return async (context: HookContext) => {
    const {method, data, params, service, id} = context
    if (method !== 'patch') return

    const param = params.jsonPatch ?? params.query.jsonPatch
    const isJsonPatch = param === true || param === 'true' || param === '1'
    if (!isJsonPatch) return
    delete params.query.jsonPatch

    if (id === undefined) throw new Error('Cannot patch multiple documents')
    if (!Array.isArray(data)) throw new Error('JSON Patch should be an array')

    const original = await service.get(id)
    context.data = patch(original, data)
    if (cleanup) context.data = cleanup(context.data)
  }
}

function patch<T>(original: T, patch: Operation[]): T {
  return applyPatch(original, patch ?? [], true, false).newDocument
}

export type SupportsJsonPatch<S extends ServiceInterface> = S & {
  patch: S['patch'] extends Function ? (
    (
      (id: NullableId, data: Operation[], _params?: Parameters<S['patch']>[2] & { jsonPatch: true }) => ReturnType<S['patch']>)
    )
  : undefined
}
