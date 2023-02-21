const createNedbService = require('feathers-nedb')
const NeDB = require('@seald-io/nedb')
const {omit} = require('lodash')

module.exports = function(options) {
  const currentService = createNedbService(options)
  const {filename} = options.Model
  const versionDBFilename = filename.replace(/.db$/, '-versions.db')
  const versionDb = new NeDB({
    filename: versionDBFilename,
    autoload: true,
  })
  versionDb.ensureIndex({fieldName: ['_recordId', '_version']})
  const versionService = createNedbService({Model: versionDb})


  /* Two databases:
   * Latest:
   *
   * in memory
   * data straight
   *
   * Versions:
   *
   * file
   * {
   *   _id //version id
 *     _recordId //Common id for different versions
 *     _version //version number
 *     _basedOn //previous version, used for undo
   * }
   */

  return {
    getModel: () => currentService.getModel(),
    getVersionModel: () => versionDb,
    find: (params) => currentService.find(params),
    get: (id, params) => currentService.get(id, params),
    create: async (data, params) => {
      const version = map(data, record => ({...record, _basedOn: null, _version: 1}))
      const res = await currentService.create(version, params)

      await createVersionData(res, params)
      return res
    },
    update: async (id, data, params) => {
      const existingData = await findEntitiesToUpdate(id, params)
      const res = await runForAll(existingData, record => {
        const patch = { ...data, _basedOn: record._version, _version: (record._version ?? 0) + 1 }
        return currentService.update(id, patch, params)
      })

      await createVersionData(res, params)
      return res
    },
    patch: async (id, data, params) => {
      const { query, ...otherParams } = params
      const existingData = await findEntitiesToUpdate(id, params)
      const versionedData = cleanUpdate(data)
      const res = await runForAll(existingData, record => {
        const patch = { ...versionedData, $set: { ...versionedData.$set, _basedOn: record._version } }
        return currentService.patch(record._id, patch, otherParams)
      })

      await createVersionData(res, params)
      return res
    },
    remove: (id, params) => {
      return currentService.remove(id, params)
    },
  }

  function findEntitiesToUpdate(id, params) {
    return currentService._findOrGet(id, params)
  }

  function createVersionData(res, params) {
    return runForAll(res, ({_id, ...record}) =>
      versionService.create({...record, _recordId: _id}, params)
    )
  }
}

function map(data, func) {
  return Array.isArray(data)
    ? data.map(func)
    : func(data)
}

function runForAll(data, func) {
  return Array.isArray(data)
    ? Promise.all(data.map(func))
    : func(data)
}

function cleanUpdate(update) {
  const patch = {
    $set: {},
    $inc: { _version: 1 },
  }
  for(const key of Object.keys(update)) {
    if (key === '$inc') {
      patch.$inc = { ...update.$inc, ...patch.$inc }
    } else if (key[0] === '$') {
      patch[key] = omit(update[key], '_version')
    } else {
      patch.$set[key] = update[key]
    }
  }
  return patch
}
