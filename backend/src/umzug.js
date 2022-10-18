const { Umzug, JSONStorage } = require('umzug')
const path = require('path')

module.exports = {
  migrateDb: async (app) => {
    const context = {
      app,
      models: getModels(app)
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
