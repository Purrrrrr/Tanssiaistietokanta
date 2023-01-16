// import deepEquals from 'fast-deep-equal'

import {ID, MergeableListItem, MergeData, MergeFunction } from './types'

import {Graph, makeGraph} from './Graph'
import { mapToIds } from './idUtils'

// eslint-disable-next-line
/* @ts-ignore */
window.m = GTSort

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

/** Merge deletes and modifications */
export function GTSort<T extends MergeableListItem>(
  data: MergeData<T[]>,
  merge: MergeFunction,
): void {
  const ids = mapMergeData(data, mapToIds)
  const idSets = mapMergeData(ids, list => new Set(list))

  const allExistingIds = new Set([
    ...ids.local.filter(id => idSets.server.has(id) || !idSets.original.has(id)),
    ...ids.server.filter(id => idSets.local.has(id) || !idSets.original.has(id)),
  ])

  const analyzedIds = mapMergeData(ids, list => {
    const idToIndex = new Map(list.map((id, index) => [id, index]))
    const ids = list.filter(id => allExistingIds.has(id))
    const at = (i: number) => ids[i]
    const nodes : Node[] = ids.map((id, index) => ({
      id,
      index,
      previous: null,
      next: null,
      isAdded: !idSets.original.has(id),
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

  const mergedGraph = makeGraph(allExistingIds)

  addEdges(mergedGraph, analyzedIds.original, analyzedIds.server, analyzedIds.local)
  console.log('-------------')
  addEdges(mergedGraph, analyzedIds.original, analyzedIds.local, analyzedIds.server)

  const noPredecessors = mergedGraph.sourceNodes()
  const noSuccessors = mergedGraph.sinkNodes()

  console.log('-------------')
  noSuccessors.forEach(node => {
    const commonSuccessor = getCommonSuccessor(node, analyzedIds)
    if (commonSuccessor) {
      console.log(`${node} -> ${commonSuccessor}`)
      mergedGraph.addEdge(node, commonSuccessor)
    }
  })
  noPredecessors.forEach(node => {
    const commonPredecessor = getCommonPredecessor(node, analyzedIds)
    if (commonPredecessor) {
      console.log(`${commonPredecessor} -> ${node}`)
      mergedGraph.addEdge(commonPredecessor, node)

      lastAddedNodesAfter(commonPredecessor, analyzedIds).forEach(lastAdded => {
        console.log(`${lastAdded} -> ${node}`)
        mergedGraph.addEdge(lastAdded, node)
      })
    }
  })

  // eslint-disable-next-line
  /* @ts-ignore */
  window.ret = mergedGraph; window.blaa = () => topologicalSort(mergedGraph, analyzedIds)
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
      console.log({from, to, lastInOriginal, originalHasTransitivePath, v2HasTransitivePath})
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
  console.log(debug.join(''))
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

function mapMergeData<T, R>(data: MergeData<T>, mapper: (t: T) => R): MergeData<R> {
  return {
    local: mapper(data.local),
    server: mapper(data.server),
    original: mapper(data.original),
  }
}

function getCommonPredecessor(node, data: MergeData<AnalyzedList>) {
  let localIndex = (data.local.indexOf(node) ?? Infinity) - 1
  let serverIndex = (data.server.indexOf(node) ?? Infinity) - 1
  //console.log({localIndex, serverIndex})
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
  //console.log({localIndex, serverIndex})
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

  //marked.add(firstLocal)
  //marked.add(firstServer)
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
        console.log('!! multiple successors '+inSuccessors.join(', '))
      }
      return inSuccessors[0]
    }
    if (rest.length > 1) {
      console.log('!! multiple rest '+rest.join(', '))
    }

    return rest.pop()! //[0]
  }
  const setToString = com => `{ ${Array.from(com).map(String).join(', ')} }`
  console.log(graph.toDot(String))

  let i = 0
  while(!graph.isEmpty() && i < 100) {
    const sourceComponents = new Set(components.sourceNodes())
    const c = Array.from(sourceComponents)
    if (c.length > 1) {
      console.log(`Many choices ${c.map(setToString).join(', ')}`)
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
      //console.log(graph.toDot(String))

      i++
    }

    console.log('Selected: '+selected.join(', '))
    components.removeNode(component)
    sourceComponents.delete(component)
    //console.log(components.toDot(setToString))
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
