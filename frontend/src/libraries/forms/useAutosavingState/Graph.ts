export interface Graph<T> {
  nodes(): Set<T>
  isEmpty(): boolean
  removeNode(node: T): void
  addEdge(from: T, to: T): void
  incomingEdges(node: T): Set<T>
  outgoingEdges(node: T): Set<T>
  sourceNodes(): readonly T[]
  sinkNodes(): readonly T[]
  connectedComponents(): Graph<Set<T>>
  toDot(nodeToStr: (node: T) => string): string
}

export function makeGraph<T>(nodeIterable: Iterable<T>): Graph<T> {
  const nodeList = Array.from(nodeIterable)
  const incoming = new Map<T, Set<T>>(
    nodeList.map(node => [node, new Set()])
  )
  const outgoing = new Map<T, Set<T>>(
    nodeList.map(node => [node, new Set()])
  )
  const nodes = new Set(nodeList)

  function incomingEdges(node: T) {
    const edges = incoming.get(node)
    if (!edges) throw new Error(`Unknown node ${node}`)
    return edges
  }
  function outgoingEdges(node: T) {
    const edges = outgoing.get(node)
    if (!edges) throw new Error(`Unknown node ${node}`)
    return edges
  }

  //Kosaraju's algorithm
  function connectedComponents(): Graph<Set<T>> {
    const visited = new Set<T>()
    const list : T[] = []

    function visit(n: T) {
      if (visited.has(n)) return

      visited.add(n)
      outgoingEdges(n).forEach(visit)
      list.push(n)
    }

    nodes.forEach(visit)
    list.reverse()

    const roots = new Map<T, T>()
    const components = new Map<T, Set<T>>()
    function assign(n: T, root: T) {
      if (roots.has(n)) return

      roots.set(n, root)
      let component = components.get(root)
      if (!component) {
        component = new Set()
        components.set(root, component)
      }
      component.add(n)
      incomingEdges(n).forEach(u => assign(u, root))
    }
    list.forEach(n => assign(n, n))

    const graph = makeGraph(Array.from(components.values()))
    graph.nodes().forEach(component => {
      component.forEach(node => {
        outgoingEdges(node).forEach(outgoing => {
          if (!component.has(outgoing)) {
            const root = roots.get(outgoing)
            if (!root) return
            const otherComponent = components.get(root)
            if (!otherComponent) return
            graph.addEdge(component, otherComponent)
          }
        })
      })
    })

    return graph
  }

  return {
    nodes: () => nodes,
    isEmpty: () => nodes.size === 0,
    addEdge: (from, to) => {
      incomingEdges(to).add(from)
      outgoingEdges(from).add(to)
    },
    removeNode: (node) => {
      nodes.delete(node)
      outgoingEdges(node).forEach(target => {
        incomingEdges(target).delete(node)
      })
      incomingEdges(node).forEach(source=> {
        outgoingEdges(source).delete(node)
      })
      incoming.delete(node)
      outgoing.delete(node)
    },
    incomingEdges,
    outgoingEdges,
    sourceNodes: () => Array.from(incoming.entries())
      .filter(([, list]) => list.size === 0)
      .map(([node]) => node),
    sinkNodes: () => Array.from(outgoing.entries())
      .filter(([, list]) => list.size === 0)
      .map(([node]) => node),
    connectedComponents,
    toDot: (nodeToStr) => {
      const edges = Array.from(outgoing.entries())
        .map(([source, outgoingEdges]) =>
          Array.from(outgoingEdges).map(target => ([source, target] as const))
        )
        .flat()
        .map(([from, to])=> `${nodeToStr(from)} -> ${nodeToStr(to)}`)
        .join('; ')
      return `digraph { ${edges} }`
    }
  }
}
