// import deepEquals from 'fast-deep-equal'
import deepEquals from 'fast-deep-equal'

import {Entity, ID, mapMergeData, MergeData, MergeFunction, MergeResult, SyncState } from './types'

import {Graph, makeGraph} from './Graph'
import { mapToIds } from './idUtils'
import merge from './mergeValues'

// eslint-disable-next-line
/* @ts-ignore */
window.m = function(t) {
  return mergeArrays(
    mapMergeData(t, (l: string[]) => l.map(i => ({_id: i, value: i}))),
    merge
  )
}
const log = (...arr) => { /*empty */} //log.bind(console)

interface AnalyzedList {
  ids: ID[]
  length: number
  at: (i: number) => ID | undefined
  nodes: Node[]
  nodeAt: (i: number) => Node | undefined
  toNode: (id: ID) => Node
  hasPathBetween(from: ID, to: ID): boolean
  has: (id: ID) => boolean
  indexOf: (id: ID) => number | undefined
}
interface Node {
  id: ID
  isAdded: boolean
  index: number
  next: Node | null
  previous: Node | null
}

export function mergeArrays<T extends Entity>(
  mergeData: MergeData<T[]>,
  merge: MergeFunction,
) : MergeResult<T[]> {
  const data = mapMergeData(mergeData, values => {
    const ids = mapToIds(values)
    const idToData = new Map(
      ids.map((id, index) =>
        [
          id,
          {
            value: values[index],
            index,
          }
        ]
      )
    )
    return {
      ids,
      has: idToData.has.bind(idToData),
      getData: idToData.get.bind(idToData),
      getValue: (id) => idToData.get(id)?.value,
    }
  })

  const addedIds = new Set([
    ...data.local.ids.filter(id => !data.original.has(id)),
    ...data.server.ids.filter(id => !data.original.has(id)),
  ])
  const allExistingIds = new Set([
    ...data.local.ids.filter(id => data.server.has(id) || !data.original.has(id)),
    ...data.server.ids.filter(id => data.local.has(id) || !data.original.has(id)),
  ])
  const hasId = allExistingIds.has.bind(allExistingIds)

  const mergedValues = new Map<ID, T>()
  const modifiedIds = new Set<ID>()
  const conflictingIds = new Set<ID>()

  data.local.ids.forEach(id => {
    const server = data.server.getValue(id)
    const original = data.original.getValue(id)
    const local = data.local.getValue(id)

    if (!local) return
    if (!server || !original) {
      mergedValues.set(id, local)
      return
    }

    const result = merge<T>({ original, local, server})
    switch(result.state) {
      case 'MODIFIED_LOCALLY':
        modifiedIds.add(id)
        mergedValues.set(id, result.pendingModifications)
        break
      case 'IN_SYNC':
        mergedValues.set(id, result.pendingModifications)
        break
      case 'CONFLICT':
        conflictingIds.add(id)
        mergedValues.set(id, result.pendingModifications)
        break
    }
  })

  data.server.ids.forEach(id => {
    if (data.original.has(id)) return
    const server = data.server.getValue(id)
    if (!server) return //Should not happen

    //Added on server
    mergedValues.set(id, server)
  })

  // TODO: do something to entries that are both modified and deleted?
  // TODO: compute duplicate additions
  //
  const r = GTSort(
    mapMergeData(data, ({ids}) =>
      ids.filter(hasId).map(id => ({id, isAdded: data.original.has(id)}))
    )
  )


  /*
  GTSort handles:
    concurrent moving
    deleting
  We need to handle:
    modification

  Conflicts:
    modificatio+delete?
   */

  const hasStructuralChanges = !deepEquals(r, data.server.ids)
  const isModified = hasStructuralChanges || modifiedIds.size  > 0
  let state : SyncState = isModified ? 'MODIFIED_LOCALLY' : 'IN_SYNC'
  if (conflictingIds.size > 0) state = 'CONFLICT'

  return {
    state,
    pendingModifications: r.map(id => {
      const val = mergedValues.get(id)
      if (!val) throw new Error('Unknown merged id '+id)
      return val
    }),
    conflicts: [],
    patch: [],
  }
}

/** Merge deletes and modifications */
export function GTSort(mergeIds: MergeData<{id: ID, isAdded: boolean}[]>) {
  const analyzedIds = mapMergeData(mergeIds, idData=> {
    const ids = idData.map(({id}) => id)
    const idToIndex = new Map(ids.map((id, index) => [id, index]))
    const at = (i: number) => ids[i]
    const nodes : Node[] = idData.map(({id, isAdded}, index) => ({
      id,
      index,
      previous: null,
      next: null,
      isAdded,
      toString: () => id,
    }))
    const nodeAt = (i: number) => nodes[i]
    nodes.forEach((node, index) => {
      node.previous = nodeAt(index-1) ?? null
      node.next = nodeAt(index+1) ?? null
    })
    const indexOf = idToIndex.get.bind(idToIndex)
    const hasPathBetween = (from: ID, to: ID) => {
      const toIndex = indexOf(to) ?? -Infinity
      const fromIndex = indexOf(from) ?? Infinity
      return fromIndex < toIndex
    }

    return {
      ids, at, nodes, nodeAt, indexOf,
      length: ids.length,
      toNode: (id: ID) => {
        const index = indexOf(id)
        if (index === undefined) throw new Error('Unknown node id '+id)
        return nodeAt(index)
      },
      hasPathBetween,
      has: idToIndex.has.bind(idToIndex),
    }
  })

  const mergedGraph = makeGraph([...analyzedIds.local.ids, ...analyzedIds.server.ids])

  addEdges(mergedGraph, analyzedIds.original, analyzedIds.server, analyzedIds.local)
  log('-------------')
  addEdges(mergedGraph, analyzedIds.original, analyzedIds.local, analyzedIds.server)

  const noPredecessors = mergedGraph.sourceNodes()
  const noSuccessors = mergedGraph.sinkNodes()

  log('-------------')
  noSuccessors.forEach(node => {
    const commonSuccessor = getCommonSuccessor(node, analyzedIds)
    if (commonSuccessor) {
      log(`${node} -> ${commonSuccessor}`)
      mergedGraph.addEdge(node, commonSuccessor)
    }
  })
  noPredecessors.forEach(node => {
    const commonPredecessor = getCommonPredecessor(node, analyzedIds)
    if (commonPredecessor) {
      log(`${commonPredecessor} -> ${node}`)
      mergedGraph.addEdge(commonPredecessor, node)

      lastAddedNodesAfter(commonPredecessor, analyzedIds).forEach(lastAdded => {
        log(`${lastAdded} -> ${node}`)
        mergedGraph.addEdge(lastAdded, node)
      })
    }
  })

  return topologicalSort(mergedGraph, analyzedIds)
}


function addEdges(mergedGraph: Graph<ID>, original: AnalyzedList, version1: AnalyzedList, version2: AnalyzedList) {
  let fromNode = version1.nodes[0]
  let lastInOriginal : ID | null = null

  const debug = [fromNode.id]
  while(fromNode.next) {
    const from = fromNode.id
    const to = fromNode.next.id
    fromNode = fromNode.next

    const originalHasPath = original.hasPathBetween(from, to)
    const v2HasPath = version2.hasPathBetween(from, to)

    if (originalHasPath && !v2HasPath) {
      debug.push(` | ${to}`)
      continue
    }
    if (fromNode.isAdded && lastInOriginal !== null) {
      const v2HasTransitivePath = version2.hasPathBetween(lastInOriginal, to)
      const originalHasTransitivePath = original.hasPathBetween(lastInOriginal, to)
      log({from, to, lastInOriginal, originalHasTransitivePath, v2HasTransitivePath})
      if (originalHasTransitivePath && !v2HasTransitivePath) {
        debug.push(` | ${to}`)
        continue
      }
    } else {
      lastInOriginal = from
    }

    debug.push(` -> ${to}`)
    mergedGraph.addEdge(from, to)
  }
  log(debug.join(''))
}

function lastAddedNodesAfter(node: ID, data: MergeData<AnalyzedList>): Set<ID> {
  const addedNodes = new Set<ID>();

  ([
    data.local.toNode(node),
    data.server.toNode(node),
  ]).forEach(n => {
    let candidate = n
    while(candidate?.next) {
      if (!candidate.next.isAdded) break
      candidate = candidate.next
    }
    if (candidate.isAdded) addedNodes.add(candidate.id)
  })
  return addedNodes
}

function getCommonPredecessor(node, data: MergeData<AnalyzedList>) {
  let localIndex = (data.local.indexOf(node) ?? Infinity) - 1
  let serverIndex = (data.server.indexOf(node) ?? Infinity) - 1
  //log({localIndex, serverIndex})
  if (localIndex === Infinity || serverIndex === Infinity) return null

  const visitedLocal = new Set()
  const visitedServer = new Set()

  for(;;) {
    const local = data.local.at(localIndex)
    const server = data.server.at(serverIndex)
    if (!local && !server) break

    if (local) visitedLocal.add(local)
    if (server) visitedServer.add(server)
    if (local && visitedServer.has(local)) return local
    if (server && visitedLocal.has(server)) return server

    localIndex--
    serverIndex--
  }
  return null
}

function getCommonSuccessor(node, data: MergeData<AnalyzedList>) {
  let localIndex = (data.local.indexOf(node) ?? Infinity) + 1
  let serverIndex = (data.server.indexOf(node) ?? Infinity) + 1
  //log({localIndex, serverIndex})
  if (localIndex === Infinity || serverIndex === Infinity) return null

  const visitedLocal = new Set()
  const visitedServer = new Set()

  for(;;) {
    const local = data.local.at(localIndex)
    const server = data.server.at(serverIndex)
    if (!local && !server) break

    if (local) visitedLocal.add(local)
    if (server) visitedServer.add(server)
    if (local && visitedServer.has(local)) return local
    if (server && visitedLocal.has(server)) return server

    localIndex++
    serverIndex++
  }
  return null
}

function topologicalSort(graph: Graph<ID>, data: MergeData<AnalyzedList>) {
  const components = graph.connectedComponents()
  const marked = new Set<ID>()

  components.nodes().forEach((component: Set<ID>) => {
    const nodes = Array.from(component)
    marked.add(firstNode(nodes, data.local))
    marked.add(firstNode(nodes, data.server))
  })

  const successors = new Set<ID>()
  const merged = [] as ID[]

  function selectNode(component: Set<ID>): ID {
    const candidates = Array.from(component).filter(node => marked.has(node))

    const inSuccessors = [] as ID[]
    const rest = [] as ID[]
    for (const node of candidates) {
      (successors.has(node) ? inSuccessors : rest).push(node)
    }

    if (inSuccessors.length > 0) {
      if (inSuccessors.length > 1) {
        log('!! multiple successors '+inSuccessors.join(', '))
      }
      return inSuccessors[0]
    }
    if (rest.length > 1) {
      log('!! multiple rest '+rest.join(', '))
    }

    return rest.pop()! //[0]
  }
  const setToString = com => `{ ${Array.from(com).map(String).join(', ')} }`
  log(graph.toDot(String))

  let i = 0
  while(!graph.isEmpty() && i < 100) {
    const sourceComponents = new Set(components.sourceNodes())
    const c = Array.from(sourceComponents)
    if (c.length > 1) {
      log(`Many choices ${c.map(setToString).join(', ')}`)
    }

    const component = c[0]
    const selected : ID[] = []

    while(component.size > 0 && i < 100) {
      const node = selectNode(component)
      selected.push(node)
      const edges = graph.outgoingEdges(node)
      edges.forEach(outgoing => {
        marked.add(outgoing)
        if (component.has(outgoing)) {
          successors.add(outgoing)
        }
      })

      merged.push(node)
      component.delete(node)
      graph.removeNode(node)
      //log(graph.toDot(String))

      i++
    }

    log('Selected: '+selected.join(', '))
    components.removeNode(component)
    sourceComponents.delete(component)
    //log(components.toDot(setToString))
  }

  return merged
}

function firstNode(nodes: ID[], list: AnalyzedList): ID {
  const getIndex = (node) => list.indexOf(node) ?? Infinity
  return nodes
    .reduce(
      (previousFirst, current) => {
        return getIndex(current) < getIndex(previousFirst)
          ? current
          : previousFirst
      }
    )
}
