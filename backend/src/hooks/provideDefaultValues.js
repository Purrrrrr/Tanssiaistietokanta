const {isListType, isObjectType, isUnionType, isNonNullType} = require('graphql')
const R = require('ramda')

module.exports = function (typeName = null, defaults = {}) {
  return context => {
    function addDefaultValues(data) {
      const dataWithDefaults = R.mergeDeepLeft(
        data,
        defaults
      )
      return getDefaultValues(context.app, typeName, dataWithDefaults)
    }

    function map(data, mapper) {
      return Array.isArray(data) ? data.map(mapper) : mapper(data)
    }

    switch(context.method) {
      case 'find':
      case 'get':
        context.result = map(context.result, addDefaultValues)
        return
      default:
        context.data = map(context.data, addDefaultValues)
        return
    }
  }
}

function getDefaultValues(app, typeName, existingValue) {
  if (!typeName) return existingValue

  const graphql = app.service('graphql')
  const type = graphql.getType(typeName)

  return getDefaultObjectValue(type, existingValue)
}

function getDefaultObjectValue(type, existingValue) {
  return {
    ...existingValue,
    ...Object.fromEntries(
      Object.values(type.getFields())
        .filter(field => !isUnionType(getBaseType(field.type)))
        .map(field => [field.name, getDefaultValue(field, existingValue?.[field.name], field.name)])
    )
  }

}

function getDefaultValue(field, existingValue) {
  const {type, defaultValue} = field

  const baseType = getBaseType(type)
  if (isListType(baseType)) {
    return (existingValue ?? []).map(item =>
      getDefaultValue({type: baseType.ofType}, item)
    )
  }
  if (isObjectType(baseType)) {
    return getDefaultObjectValue(baseType, existingValue)
  }
  let def
  switch(baseType.toString()) {
    case 'String':
      def = ''
      break
    case 'Int':
    case 'Float':
      def = 0
      break
  }
  return existingValue ?? defaultValue ?? baseType.defaultValue ?? def ?? null
}

function getBaseType(type) {
  if (isNonNullType(type)) return getBaseType(type.ofType)
  //if (type.ofType) return getBaseType(type.ofType)
  return type
}
