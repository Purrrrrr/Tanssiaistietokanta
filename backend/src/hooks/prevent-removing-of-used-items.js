const {isUsedBySomething} = require('../utils/dependencies');

module.exports = function () {
  return function preventRemovingOfUsedItems(context) {
    const {id, path} = context;
    if (isUsedBySomething(path, id)) {
      context.statusCode = 409;
      context.result = {
        className: 'item-is-in-use',
      };
    }
  };
};
