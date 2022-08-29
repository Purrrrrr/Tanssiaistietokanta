const {isNonNullType, isListType} = require('graphql');

module.exports = function (typeName = null, defaults = {}) {
  return context => {
    const defaultValues = getDefaultValues(context.app, typeName, defaults);
    
    function addDefaultValues(value) {
      return {...defaultValues, ...value} ;
    }
    
    const {data} = context;
    context.data = Array.isArray(data) ? data.map(addDefaultValues) : addDefaultValues(data);
  };
};

function getDefaultValues(app, typeName, defaults) {
  if (!typeName) return defaults;

  const graphql = app.service('graphql');
  const type = graphql.getType(typeName);
  
  return {
    ...defaults,
    ...getDefaultValuesFromType(type)
  };
}

function getDefaultValuesFromType(type) {
  return Object.fromEntries(
    Object.values(type.getFields())
      .map(field => [field.name, getDefaultValue(field)])
  );
}

function getDefaultValue(field) {
  const {type, defaultValue} = field;
  if (defaultValue) {
    return defaultValue;
  }

  if (isNonNullType(type)) {
    if (isListType(type.ofType)) {
      return [];
    }
    if (type.ofType.defaultValue) {
      return defaultValue;
    }
    switch(type.ofType.toString()) {
      case 'String':
        return '';
    }
  }


  return null;
}
