import * as L from 'partial.lenses'

const everyObject= L.lazy(rec =>
  L.cond(
    [Array.isArray, [L.elems, rec]],
    [a => typeof(a) === 'object' && a !== null, L.seq([L.children, rec], [])],
  )
)
export const removeTypenames = L.remove([everyObject, '__typename'])
