const path = require('path');
const {fileLoader, mergeTypes } = require('merge-graphql-schemas');

const types = fileLoader(path.join(__dirname, '/../**/*.schema.graphql'));

module.exports = mergeTypes(types);
