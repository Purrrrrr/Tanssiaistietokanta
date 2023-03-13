const createNedbService = require('feathers-nedb')
const NeDB = require('@seald-io/nedb')
const {debounce} = require('lodash')

const VERSION_SAVE_DELAY_MS = 5000
const MAX_VERSION_SAVE_DELAY_MS = 60000

/* Two databases: Latest and versions
 *
 * Versions:
 *
 * {
 *   _id //version id
 *   _recordId //Common id for different versions
 *   _version //version number
 * }
 */
module.exports = function(options) {
  const currentService = createNedbService(options)
  const versionService = getVersionService(options)

  const versionStoreFunctions = new Map()

  return {
    getModel: () => currentService.getModel(),
    getVersionModel: () => versionService.getModel(),
    find: (params) => currentService.find(params),
    get: (id, params) => currentService.get(id, params),
    create: async (data, params) => {
      const res = await currentService.create(addTimestamps(data, now()), params)

      return queueVersionSave(res)
    },
    update: async (id, data, params) => {
      const res = await currentService.update(id, addTimestamps(data), params)

      return queueVersionSave(res)
    },
    patch: async (id, data, params) => {
      const res = await currentService.patch(id, addTimestamps(data), params)

      return queueVersionSave(res, params)
    },
    remove: (id, params) => {
      return currentService.remove(id, params)
    },
  }

  async function queueVersionSave(res) {
    runForAll(res, ({_id, ...record}) =>
      getDebouncedSaveVersion(_id)({...record, _recordId: _id})
    )
    return res
  }

  function getDebouncedSaveVersion(id) {
    return computeIfAbsent(versionStoreFunctions, id, () =>
      debounce((data) => {
        versionStoreFunctions.delete(id)
        versionService.create(data)
      }, VERSION_SAVE_DELAY_MS, {maxWait: MAX_VERSION_SAVE_DELAY_MS})
    )
  }
}

function getVersionService(options) {
  const {filename} = options.Model
  const versionDBFilename = filename.replace(/.db$/, '-versions.db')
  const versionDb = new NeDB({
    filename: versionDBFilename,
    autoload: true,

  })
  versionDb.ensureIndex({fieldName: ['_recordId', '_id']})
  return createNedbService({Model: versionDb})
}

function map(data, func) {
  return Array.isArray(data)
    ? data.map(func)
    : func(data)
}

function runForAll(data, func) {
  return Array.isArray(data)
    ? data.forEach(func)
    : func(data)
}

function computeIfAbsent(map, key, getDefault) {
  if (map.has(key)) {
    return map.get(key)
  }
  const def = getDefault()
  map.set(key, def)
  return def
}

function addTimestamps(data, _createdAt) {
  return map(data, item => ({
    ...item,
    ...(_createdAt ? {_createdAt} : {}),
    _updatedAt: now()
  }))
}
const now = () => new Date().toISOString()
