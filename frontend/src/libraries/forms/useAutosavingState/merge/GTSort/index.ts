import {ID, mapMergeData, MergeData } from '../../types'

import { getTopNodes } from './comparisons'
import {Graph, makeGraph} from './Graph'

const log : (...a: unknown[]) => void = () => { /* */ }

type InputData = MergeData<{
  id: ID
  removedInOtherVersion: boolean
  isAdded: boolean
}[]>

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
  removedInOtherVersion: boolean
  index: number
  next: Node | null
  previous: Node | null
}

/** Merge deletes and modifications */
export function GTSort(mergeIds: InputData) {
  const analyzedIds = mapMergeData(mergeIds, idData=> {
    const ids = idData.map(({id}) => id)
    const idToIndex = new Map(ids.map((id, index) => [id, index]))
    const at = (i: number) => ids[i]
    const nodes : Node[] = idData.map(({id, isAdded, removedInOtherVersion}, index) => ({
      id,
      index,
      previous: null,
      next: null,
      isAdded,
      removedInOtherVersion,
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
  addEdges(mergedGraph, analyzedIds.original, analyzedIds.local, analyzedIds.server)

  const noPredecessors = mergedGraph.sourceNodes()
  const noSuccessors = mergedGraph.sinkNodes()

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
  log(mergedGraph.toDot(String))
  const serverVersion = topologicalSort(mergedGraph.clone(), analyzedIds, 'server')
  const localVersion = topologicalSort(mergedGraph, analyzedIds, 'local')

  log(serverVersion)
  log(localVersion)

  return {
    serverVersion, localVersion
  }
}


function addEdges(mergedGraph: Graph<ID>, original: AnalyzedList, version1: AnalyzedList, version2: AnalyzedList) {
  if (version1.length === 0) return
  let fromNode = version1.nodes[0]
  let lastInOriginal : ID | null = null

  const debug = [fromNode.id]
  while(fromNode.next) {
    const {id: from, isAdded, removedInOtherVersion} = fromNode
    const {id: to, removedInOtherVersion: removedInOtherVersion2} = fromNode.next
    fromNode = fromNode.next

    const originalHasPath = original.hasPathBetween(from, to)
    const v2HasPath = version2.hasPathBetween(from, to)

    if (originalHasPath && !v2HasPath && !removedInOtherVersion && !removedInOtherVersion2) {
      debug.push(` | ${to}`)
      continue
    }

    if (isAdded && lastInOriginal !== null) {
      const v2HasTransitivePath = version2.hasPathBetween(lastInOriginal, to)
      const originalHasTransitivePath = original.hasPathBetween(lastInOriginal, to)
      //log({from, to, lastInOriginal, originalHasTransitivePath, v2HasTransitivePath})
      if (originalHasTransitivePath && !v2HasTransitivePath) {
        debug.push(` | ${to}`)
        continue
      }
    } else if (!isAdded){
      lastInOriginal = from
    }

    debug.push(` -> ${to}`)
    mergedGraph.addEdge(from, to)
  }
  log(debug.join(''))
}

function lastAddedNodesAfter(id: ID, data: MergeData<AnalyzedList>): ID[] {
  return [data.local, data.server]
    .map(versionData => {
      let candidate = versionData.toNode(id)
      while(candidate?.next?.isAdded) {
        candidate = candidate.next
      }
      return candidate
    })
    .filter(n => n.isAdded)
    .map(n => n.id)
}

function getCommonPredecessor(node, data: MergeData<AnalyzedList>) {
  let localIndex = (data.local.indexOf(node) ?? Infinity) - 1
  let serverIndex = (data.server.indexOf(node) ?? Infinity) - 1
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

function topologicalSort(graph: Graph<ID>, data: MergeData<AnalyzedList>, preferVersion: 'server' | 'local') {
  const components = graph.connectedComponents()
  const marked = new Set<ID>()
  const successors = new Set<ID>()
  const merged = [] as ID[]
  const preferredVersion = data[preferVersion]
  const otherVersion = data[preferVersion === 'server' ? 'local' : 'server']

  components.nodes().forEach((component: Set<ID>) => {
    marked.add(firstNode(component, data.local))
    marked.add(firstNode(component, data.server))
  })

  function selectNode(component: Set<ID>): ID {
    const candidates = Array.from(component).filter(node => marked.has(node))
    //console.log('!! '+candidates.join(', '))

    const top = getTopNodes(
      candidates,
      id => successors.has(id),
      id => {
        const indexOfCandidate = preferredVersion.indexOf(id) ?? Infinity
        //Prefer candidates that are first in the list
        //log(id, -indexOfCandidate)
        return -indexOfCandidate
      },
      id => {
        const indexOfCandidate = otherVersion.indexOf(id) ?? Infinity
        //Prefer candidates that are first in the list
        //log(id, -indexOfCandidate)
        return -indexOfCandidate
      }
    )
    if (top.length > 1) {
      console.log('!! multiple nodes '+top.join(', '))
      throw new Error('Can\'t decide next node. This should not happen')
    } else {
      //log('!! one '+top[0])
    }

    return top[0]
  }
  const setToString = com => `{ ${Array.from(com).map(String).join(', ')} }`

  function getRank(c: Set<ID>): number {
    //The higher numbers go first
    if (c.size > 1) return 1 //Complex group, probably not added
    const id = firstItem(c)

    if (data.original.has(id)) return 1 //Not added
    if (data.local.has(id)) return 2 //Added to local
    if (data.server.has(id)) return 3 //Added to server
    throw new Error('??')
  }
  function getStartIndexInPreferred(c: Set<ID>): number {
    const node = selectNode(c)
    return -(preferredVersion.indexOf(node) ?? Infinity)
  }
  function getStartIndexInOther(c: Set<ID>): number {
    const node = selectNode(c)
    return -(otherVersion.indexOf(node) ?? Infinity)
  }

  while(!graph.isEmpty()) {
    const sourceComponents = new Set(components.sourceNodes())

    const topComponents = getTopNodes(sourceComponents,
      getRank,
      getStartIndexInPreferred,
      getStartIndexInOther,
    )

    //console.log(`Choices ${Array.from(sourceComponents).map(setToString).join(', ')}`)
    if (topComponents.length > 1) {
      console.log(`Many choices ${topComponents.map(setToString).join(', ')}`)
      topComponents.forEach(comp => {
        log(setToString(comp), getRank(comp), getStartIndexInPreferred(comp))
      })
      throw new Error('Can\'t decide next node. This should not happen')
    }

    const component = topComponents[0]
    const selected : ID[] = []

    while(component.size > 0) {
      const node = selectNode(component)
      selected.push(node)
      const edges = graph.outgoingEdges(node)
      edges.forEach(outgoing => {
        marked.add(outgoing)
        if (component.has(outgoing)) {
          successors.add(outgoing)
        }
      })

      if (preferredVersion.has(node) || !otherVersion.toNode(node).removedInOtherVersion) {
        merged.push(node)
      }
      component.delete(node)
      graph.removeNode(node)
      //log(graph.toDot(String))
    }

    //log('Selected: '+selected.join(', '))
    components.removeNode(component)
    sourceComponents.delete(component)
    //log(components.toDot(setToString))
  }

  return merged
}

function firstNode(nodes: Set<ID>, list: AnalyzedList): ID {
  return getTopNodes(nodes, id => -(list.indexOf(id) ?? Infinity))[0]
}


function firstItem<T>(set: Set<T>): T {
  return Array.from(set)[0]
}
