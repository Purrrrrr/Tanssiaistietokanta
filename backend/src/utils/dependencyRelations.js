const fs = require('fs')
const jsonata = require('jsonata')

const servicesDir = `${__dirname}/../services`

function loadDependencyTypes(serviceName) {
  const filename = `${servicesDir}/${serviceName}/entityDependencies.json`
  if (!fs.existsSync(filename)) return null

  const doc = JSON.parse(fs.readFileSync(filename))
  const ids = new Set()
  return doc.map(relation => {
    const expression = jsonata(`$append($distinct(${relation.path}), [])`)
    return {
      id: getUniqueId(`${serviceName}-${relation.type}-${relation.service}`, ids),
      getLinkedIds: expression.evaluate,
      sourceService: serviceName,
      ...relation
    }
  })
}

function getUniqueId(idBase, idSet) {
  let id = idBase
  let counter = 1
  while (idSet.has(id)) {
    counter++
    id = `${idBase}-${counter}`
  }
  idSet.add(id)
  return id
}

module.exports = {
  loadDependencyTypes
}
