const { Umzug, JSONStorage } = require('umzug')
const path = require('path')
const NeDB = require('@seald-io/nedb')
const createService = require('feathers-nedb')

module.exports = {
  migrateDb: async (app) => {
    const models = getModels(app)
    const dbPath = app.get('nedb')
    const context = {
      getModel: (name) => {
        if (name in models) return models[name]
        const Model = new NeDB({
          filename: path.join(dbPath, name+'.db'),
          autoload: true
        })
        return createService({ Model })
      },
    }
    const umzug = getUmzug(context)

    await umzug.up()
  },
  createMigration: (name) => {
    getUmzug(null).create({
      name,
      folder: path.join(__dirname, '/migrations'),
      skipVerify: true
    })
  }
}

function getUmzug(context) {
  return new Umzug({
    migrations: { glob: path.join(__dirname, '/migrations/*.js') },
    context,
    storage: new JSONStorage({ path: path.join(__dirname, '../data/executed-migrations.json') }),
    logger: console
  })
}

function getModels(app) {
  return Object.fromEntries(
    Object.entries(app.services)
      .map(([k, service]) => ([k, service?.getModel?.()]))
      .filter(([, model]) => model)
  )
}
