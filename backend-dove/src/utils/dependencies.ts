import type { Id } from '@feathersjs/feathers'
import type { EntityDependency } from './dependencyRelations'

import R from 'ramda'
import getOrComputeDefault from './computeIfAbsent'

type ServiceName = string
interface Entity {
  _id: Id
}
interface ItemDependencies {
  dependencies: Map<EntityDependency, Set<Id>>,
  reverseDependencies: Map<EntityDependency, Set<Id>>,
}
type RelationType = 'usedBy' | 'uses' | 'childOf' | 'parentOf'

const serviceItemDependencies = new Map<ServiceName, Map<Id, ItemDependencies>>()

/* Types of depencies
 *
 * childOf <-> parentOf
 *
 * The parts are deleted with the parent
 *
 * usedBy <-> uses
 *
 * The used cannot be deleted while the parent uses them
 *
 * event uses dances and eventProgram
 * workshops are part of events
 */
const dependencyTypePairs : Record<RelationType, RelationType> = {
  usedBy: 'uses',
  uses: 'usedBy',
  childOf: 'parentOf',
  parentOf: 'childOf'
}

export function registerDependencies(sourceService: ServiceName, item: Entity, relations: EntityDependency[]) {
  if (Array.isArray(item)) {
    item.forEach(i => registerDependencies(sourceService, i, relations))
    return
  }
  relations.forEach(
    (relation) => {
      const {getLinkedIds} = relation
      const ids = getLinkedIds(item)

      ids.forEach(id => {
        registerDepedency({
          sourceId: item._id,
          targetId: id,
          relation
        })
      })
    }
  )
}

function registerDepedency(
  {sourceId, targetId, relation}: {
    sourceId: Id
    targetId: Id
    relation: EntityDependency
  }
) {
  const sourceNode = getItemDependencyNode(relation.sourceService, sourceId)
  const targetNode = getItemDependencyNode(relation.service, targetId)

  const sourceRelationIds = getOrComputeDefault(sourceNode.dependencies, relation, () => new Set())
  const targetRelationIds = getOrComputeDefault(targetNode.reverseDependencies, relation, () => new Set())

  sourceRelationIds.add(targetId)
  targetRelationIds.add(sourceId)
}

export function updateDependencies(serviceName: ServiceName, item: Entity, relations: EntityDependency[]) {
  clearDependencies(serviceName, item)
  registerDependencies(serviceName, item, relations)
}

export function clearDependencies(service: ServiceName, item: Entity) {
  if (Array.isArray(item)) {
    item.forEach(i => clearDependencies(service, i))
    return
  }
  const id = item._id
  const deps = getItemDependencyNode(service, id)
  for (const [relation, targetIds] of deps.dependencies.entries()) {
    for (const targetId of targetIds) {
      const targetDeps = getItemDependencyNode(relation.service, targetId)
      targetDeps.reverseDependencies.get(relation)?.delete(id)
    }
  }
  deps.dependencies = new Map()
}

export function isUsedBySomething(service: ServiceName, id: Id) {
  return getDependencyLinks(service, id, 'usedBy').size > 0
}

export function getDependenciesFor(service: ServiceName, item: Entity | Entity[], linkType: RelationType, otherService: ServiceName) {
  if (Array.isArray(item)) {
    if (!linkType) throw new Error('Missing link type')
    if (!otherService) throw new Error('Missing other service')
    return R.uniq(
      item.map(({_id})=>
        Array.from(getDependencyLinks(service, _id, linkType, otherService))
      ).flat()
    )
  }
  const id = item._id
  return Array.from(getDependencyLinks(service, id, linkType, otherService))
}

function getDependencyLinks(service: ServiceName, id: Id, linkType: RelationType): Map<ServiceName, Set<Id>>
function getDependencyLinks(service: ServiceName, id: Id, linkType: RelationType, otherService: ServiceName): Set<Id>
function getDependencyLinks(service: ServiceName, id: Id, linkType: RelationType, otherService?: ServiceName) {
  const {dependencies, reverseDependencies} = getItemDependencyNode(service, id)
  const links = new Map<ServiceName, Set<Id>>()

  for (const [relation, ids] of dependencies.entries()) {
    if (relation.type !== linkType) continue
    if (otherService && relation.service !== otherService) continue

    const idSet = getOrComputeDefault(links, relation.service, () => new Set())
    ids.forEach(id => idSet.add(id))
  }
  for (const [relation, ids] of reverseDependencies.entries()) {
    if (relation.type !== dependencyTypePairs[linkType]) continue
    if (otherService && relation.sourceService !== otherService) continue

    const idSet = getOrComputeDefault(links, relation.sourceService, () => new Set())
    ids.forEach(id => idSet.add(id))
  }

  if (otherService) {
    return links.get(otherService) || new Set()
  }
  return links
}

function getItemDependencyNode(service: ServiceName, id: Id): ItemDependencies {
  const deps = getOrComputeDefault(serviceItemDependencies, service, () => new Map())
  return getOrComputeDefault(deps, id, () => ({
    dependencies: new Map(),
    reverseDependencies: new Map()
  }))
}
