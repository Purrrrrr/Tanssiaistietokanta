import type { Id } from '@feathersjs/feathers'

import { Type, Static, getValidator } from '@feathersjs/typebox'
import fs from 'fs'
import jsonata from 'jsonata'
import { ServiceTypes } from '../declarations'
import { dataValidator } from '../validators'

const servicesDir = `${__dirname}/../services`

const entityDependenciesSchema = Type.Object({
  type: Type.Union( [
    Type.Literal('childOf'),
    Type.Literal('parentOf'),
    Type.Literal('uses'),
    Type.Literal('usedBy'),
  ]),
  service: Type.String(),
  path: Type.String()
})

const jsonValidator = getValidator(entityDependenciesSchema, dataValidator)

type EntityDependencyJson = Static<typeof entityDependenciesSchema>

export interface EntityDependency extends EntityDependencyJson {
  id: string
  getLinkedIds: (i: unknown) => Id[]
  sourceService: string
}

type ServiceName = string

export function loadDependencyTypes(serviceName: ServiceName): EntityDependency[] {
  const filename = `${servicesDir}/${serviceName}/entityDependencies.json`
  if (!fs.existsSync(filename)) return []

  const doc = JSON.parse(fs.readFileSync(filename, {encoding: 'utf-8'})) as EntityDependencyJson[]
  const ids = new Set<Id>()
  return doc.map((relation: any) => {
    const expression = jsonata(`$append($distinct(${relation.path}), [])`)
    return {
      id: getUniqueId(`${serviceName}-${relation.type}-${relation.service}`, ids),
      getLinkedIds: expression.evaluate,
      sourceService: serviceName,
      ...relation
    }
  })
}

function getUniqueId(idBase: Id, idSet: Set<Id>) {
  let id = idBase
  let counter = 1
  while (idSet.has(id)) {
    counter++
    id = `${idBase}-${counter}`
  }
  idSet.add(id)
  return id
}
