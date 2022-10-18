
async function evolveObjAsync(transformations, object) {
  if (object === null) return object
  if (typeof object !== 'object') return object

  const result = object instanceof Array ? [] : {}

  for (const [key, value] of Object.entries(object)) {
    if (key in transformations) {
      result[key] = await getModifiedValue(transformations[key], value)
    } else {
      result[key] = object[key]
    }
  }

  return result
}

async function getModifiedValue(transformation, value) {
  switch (typeof transformation) {
    case 'function':
      return await transformation(value)
    case 'object':
      return await evolveObjAsync(transformation, value)
    default:
      return transformation
  }
}

module.exports = (r, o) => o ? evolveObjAsync(r, o) : (obj) => evolveObjAsync(r, obj)
