// For more information about this file see https://dove.feathersjs.com/guides/cli/hook.html
import type { HookContext } from '../declarations'
import type { Id, ServiceInterface } from '@feathersjs/feathers'
import { applyPatch, Operation } from 'fast-json-patch'
import { AddAccessControlData } from '../services/access/hooks'

export type JSONPatch = Operation[]

export const mergeJsonPatch = (cleanup?: (data: unknown) => unknown) => {
  return async (context: HookContext) => {
    const { data, params, service, id } = context
    if (!isJsonPatch(context)) return
    if (params.query) delete params.query.jsonPatch

    if (id === undefined) throw new Error('Cannot patch multiple documents')
    if (!Array.isArray(data)) throw new Error('JSON Patch should be an array')

    if (data.length === 0) {
      // Prevent empty patch from creating an entity version
      context.data = {}
      return
    }
    const original = await service.get(id, { [AddAccessControlData]: false })
    context.data = getPatched(original, data)
    if (cleanup) context.data = cleanup(context.data)
  }
}

export function isJsonPatch(ctx: HookContext): boolean {
  const { method, params } = ctx
  if (method !== 'patch') return false

  const param = params?.jsonPatch ?? params?.query?.jsonPatch
  return param === true || param === 'true' || param === '1'
}

export function getPatched<T>(original: T, patch: Operation[]): T {
  return applyPatch(original, patch ?? [], true, false).newDocument
}

export type SupportsJsonPatch<S extends { patch?: (...args: any[]) => any }> = S & {
  patch: S extends ServiceInterface<infer Result, any, infer Params>
  ? (
    (id: Id, data: Operation[], params?: Params & { jsonPatch: true }) => Promise<Result>
  )
  : undefined
}
