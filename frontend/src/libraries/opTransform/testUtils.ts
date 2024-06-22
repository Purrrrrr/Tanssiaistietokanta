import { Operation } from './types'

import { NO_OP, setOpExtra } from './ops'

const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom')
setOpExtra({
  [customInspectSymbol](_depth, inspectOptions, inspect) {
    const op = this as Operation
    if (op.type === 'StringModification') {
      const {index, add, remove} = op
      if (remove === '') return `Insert(${index}, "${add}")`
      if (add === '') return `Delete(${index}, "${remove}")`
      return `StrMod(${index}, add: "${add}", remove: "${remove}")`
    }
    if (op.type === 'ListSplice') {
      const {index, add, remove} = op
      if (remove.length === 0) return `Insert(${index}, ${inspect(add)})`
      if (add.length === 0) return `Delete(${index}, ${inspect(remove)})`
      return `ListSplice(${index}, add: ${inspect(add)}, remove: ${inspect(remove)})`
    }
    const {type, ...obj} = op

    const objStr = Object.keys(obj)
      .map(key => `${key}: ${inspect(obj[key], inspectOptions)}`)
      .join(', ')
    return `${type}(${objStr})`
  }
})
NO_OP[customInspectSymbol] = () => 'NoOp'
