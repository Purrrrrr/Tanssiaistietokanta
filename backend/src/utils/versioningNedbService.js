const createNedbService = require('feathers-nedb')
const NeDB = require('@seald-io/nedb')
const {omit} = require('lodash')

/* Two databases:
 * Latest:
 *
 * in memory
 * data straight with _version and _basedOn
 *
 * Versions:
 *
 * {
 *   _id //version id
 *   _recordId //Common id for different versions
 *   _version //version number
 *   _basedOn //previous version, used for undo
 * }
 */
module.exports = function(options) {
  const currentService = createNedbService(options)
  const versionService = getVersionService(options)

  return {
    getModel: () => currentService.getModel(),
    getVersionModel: () => versionService.getModel(),
    find: (params) => currentService.find(params),
    get: (id, params) => currentService.get(id, params),
    create: async (data, params) => {
      const res = await currentService.create(
        map(data, addFirstVersionInfo),
        params,
      )

      return createVersionData(res, params)
    },
    update: async (id, data, {query, ...params}) => {
      const res = await updateAndVersionRecords(id, query, (_id, versionData)=> {
        const patch = { ...data, ...versionData }
        return currentService.update(_id, patch, params)
      })

      return createVersionData(res, params)
    },
    patch: async (id, data, {query, ...params}) => {
      const cleanedData = cleanUpdate(data)

      const res = await updateAndVersionRecords(id, query, (_id, versionData)=> {
        const patch = { ...cleanedData, ...versionData }
        return currentService.patch(_id, patch, params)
      })

      return createVersionData(res, params)
    },
    remove: (id, params) => {
      return currentService.remove(id, params)
    },
  }

  async function updateAndVersionRecords(id, query, func) {
    const existingData = await currentService._findOrGet(id, {query})

    return runForAll(existingData, record =>
      func(record._id, {
        _basedOn: record._version,
        _version: (record._version ?? 0) + 1,
      })
    )
  }

  async function createVersionData(res, params) {
    await runForAll(res, ({_id, ...record}) =>
      versionService.create({...record, _recordId: _id}, params)
    )
    return res
  }
}

function addFirstVersionInfo(record) {
  return {...record, _basedOn: null, _version: 1}
}

function getVersionService(options) {
  const {filename} = options.Model
  const versionDBFilename = filename.replace(/.db$/, '-versions.db')
  const versionDb = new NeDB({
    filename: versionDBFilename,
    autoload: true,
  })
  versionDb.ensureIndex({fieldName: ['_recordId', '_version']})
  return createNedbService({Model: versionDb})
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
  }
  for(const key of Object.keys(update)) {
    if (key[0] === '$') {
      patch[key] = omit(update[key], '_version')
    } else {
      patch.$set[key] = update[key]
    }
  }
  return patch
}
