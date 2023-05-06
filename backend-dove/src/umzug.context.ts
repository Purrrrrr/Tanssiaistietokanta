import { MigrationFn as UmzugMigrationFn } from 'umzug';
import type { ServiceInterface } from '@feathersjs/feathers'
import path from 'path'
import { memoize } from 'lodash'
import NeDB from '@seald-io/nedb'
import updateDatabase from './utils/updateDatabase'
import VersioningNeDBService from './utils/VersioningNeDBService'
import type { Application } from './declarations'

export type MigrationFn = UmzugMigrationFn<MigrationContext>

export interface MigrationContext {
  getModel(name: string): NeDB
  getVersionModel(name: string): NeDB
  getService(name: string): ServiceInterface
  updateDatabase(name: string, modificator: (i: unknown) => unknown): Promise<void>
}

export function getContext(app: Application) {
  const dbPath = app.get('nedb')
  const services = app.services
  const models = getModels(app)
  const versionModels = getVersionModels(app)

  function getService(name: string) {
    return name in services
      ? services[name as keyof typeof services]
      : new VersioningNeDBService({ app, dbname: name })
  }
  function getVersionModel(name: string) {
    return versionModels[name] ?? getDb(name)
  }
  function getModel(name: string) {
    return models[name] ?? getDb(name)
  }
  const getDb = memoize(function getDb(name: string) {
    return new NeDB({
      filename: path.join(dbPath, name+'.db'),
      autoload: true
    })
  })
  return {
    getModel,
    getVersionModel,
    getService,
    updateDatabase: async (name: string, modificator: (i: unknown) => unknown) => {
      await updateDatabase(getModel(name), modificator)
      await updateDatabase(getVersionModel(name), modificator)
    }
  }
}

function getModels(app: Application) {
  return Object.fromEntries(
    Object.entries(app.services)
      .map(([k, service]) => ([k, service?.getModel?.()]))
      .filter(([, model]) => model)
  )
}

function getVersionModels(app: Application) {
  return Object.fromEntries(
    Object.entries(app.services)
      .map(([k, service]) => ([k, service?.getVersionModel?.()]))
      .filter(([, model]) => model)
  )
}
