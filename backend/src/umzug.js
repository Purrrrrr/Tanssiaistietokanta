const { Umzug, JSONStorage } = require('umzug')
const { memoize } = require('lodash')
const path = require('path')
const NeDB = require('@seald-io/nedb')
const updateDatabase = require('./utils/updateDatabase')
const createVersioningService = require('./utils/versioningNedbService')

module.exports = {
  migrateDb: async (app) => {
    const dbPath = app.get('nedb')
    const services = app.services
    const models = getModels(app)
    const versionModels = getVersionModels(app)

    function getService(name) {
      return services[name] ?? createVersioningService({ Model: getModel(name) })
    }
    function getVersionModel(name) {
      return versionModels[name] ?? getDb(name)
    }
    function getModel(name) {
      return models[name] ?? getDb(name)
    }
    const getDb = memoize(function getDb(name) {
      return new NeDB({
        filename: path.join(dbPath, name+'.db'),
        autoload: true
      })
    })

    const context = {
      getModel,
      getVersionModel,
      getService,
      updateDatabase: async (name, modificator) => {
        await updateDatabase(getModel(name), modificator)
        await updateDatabase(getVersionModel(name), modificator)
      }
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

function getVersionModels(app) {
  return Object.fromEntries(
    Object.entries(app.services)
      .map(([k, service]) => ([k, service?.getVersionModel?.()]))
      .filter(([, model]) => model)
  )
}
