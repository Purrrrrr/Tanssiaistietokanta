const { print } = require('graphql');
const { loadFilesSync } = require('@graphql-tools/load-files')
const { mergeTypeDefs } = require('@graphql-tools/merge')

const types = loadFilesSync(`${__dirname}/../**/*.schema.graphql`);

module.exports = print(mergeTypeDefs(types));
