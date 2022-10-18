const NeDB = require('@seald-io/nedb')
const path = require('path')

module.exports = function (app) {
  const dbPath = app.get('nedb')
  const Model = new NeDB({
    filename: path.join(dbPath, 'workshops.db'),
    autoload: true
  })
  Model.ensureIndex({fieldName: 'dances', sparse: true})

  return Model
}
