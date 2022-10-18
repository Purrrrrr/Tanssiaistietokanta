// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

/* Prevents the use of complicated operations like $push when patching objects
 * Accepts optional keys array of keys to forbid modifying.
 *
 * Used when some other needs to modify the patched contents further so that
 * it's always in the same input format.
*/
module.exports = function ({keys}) {
  return async context => {
    const {method, data} = context

    if (context.params.provider === 'graphql') {
      //Should already be without operations
      return
    }
    if (method === 'PATCH') {
      if (keys) {
        throwifmodifieskeys(data, keys)
      } else {
        throwifmodifiesObject(data)
      }
      /* Move all $set ops to root level */
      if (data['$set']) {
        const set = data['$set']
        delete data['$set']
        context.data = { ...set, ...data }
      }
    }
    return context
  }
}

function getModificationOps(data) {
  const keys = Object.keys(data)
  return keys.filter(key => key[0] === '$' && key !== '$set')
}

function throwifmodifiesObject(data) {
  const modifyOps = getModificationOps(data)
  modifyOps.forEach(op => {
    const hasOps = Object.keys(data[op]).length > 0
    if (hasOps) {
      throw Error(op+' not supported')
    }
  })
}

function throwifmodifieskeys(data, forbiddenKeys) {
  const modifyOps = getModificationOps(data)
  modifyOps.forEach(op => {
    for(const key of forbiddenKeys) {
      if (data[op][key]) {
        const msg = `${op} not supported on keys ${forbiddenKeys.join(', ')}`
        throw Error(msg)
      }
    }
  })
}
