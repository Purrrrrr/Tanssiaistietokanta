import { NO_OP, Operation, setOpExtra } from './types'

const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom')
setOpExtra({
  [customInspectSymbol](_depth, inspectOptions, inspect) {
    if (this.type === 'StringModification') {
      const {index, add, remove} = this
      if (remove === '') return `Insert(${index}, "${add}")`
      if (add === '') return `Delete(${index}, "${remove}")`
      return `StrMod(${index}, add: "${add}", remove: "${remove}")`
    }
    if (this.type === 'ListSplice') {
      const {index, add, remove} = this
      if (remove.length === 0) return `Insert(${index}, ${inspect(add)})`
      if (add.length === 0) return `Delete(${index}, ${inspect(remove)})`
      return `ListSplice(${index}, add: ${inspect(add)}, remove: ${inspect(remove)})`
    }

    const {type, ...obj} = this as Operation
    const objStr = Object.keys(obj)
      .map(key => `${key}: ${inspect(obj[key], inspectOptions)}`)
      .join(', ')
    return `${type}(${objStr})`
  }
})
NO_OP[customInspectSymbol] = () => 'NoOp'
