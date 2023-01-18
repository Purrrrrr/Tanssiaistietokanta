type Comparable = string | number | boolean
type Mapper<T> = (t: T) => Comparable

export function getTopNodes<T>(nodes: Set<T> | T[], comparedFeatures: [Mapper<T>, ...Mapper<T>[]]): T[] {
  let top : T[] = []
  let currentValues: Comparable[] = []

  nodes.forEach(node => {
    if (top.length === 0) {
      top.push(node)
      return
    }

    for (let i = 0; i < comparedFeatures.length; i++) {
      const mapper = comparedFeatures[i]
      if (i >= currentValues.length) currentValues.push(mapper(top[0]))
      const topValue = currentValues[i]
      const currentValue = mapper(node)

      if (currentValue > topValue) {
        top = [node]
        currentValues = []
        return
      } else if (currentValue < topValue) {
        return
      }
    }
    //Values are truly equal
    top.push(node)
  })

  return top
}
