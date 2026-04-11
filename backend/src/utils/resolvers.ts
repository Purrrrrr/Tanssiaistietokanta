import { TObject, TProperties } from '@feathersjs/typebox'
import { GraphQLResolveInfo } from 'graphql'

export function toSelect<E extends TProperties>(info: GraphQLResolveInfo, schema: TObject<E>) {
  const fields = info.fieldNodes[0].selectionSet?.selections
  if (!fields) return undefined
  return fields
    .filter(f => f.kind === 'Field')
    .map(f => f.name.value)
    .filter(f => f in schema.properties)
    .filter(f => f !== '__typename') as unknown as (keyof E)[]
}
