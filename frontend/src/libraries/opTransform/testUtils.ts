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

    const {type, ...obj} = this as Operation
    const objStr = Object.keys(obj)
      .map(key => `${key}: ${inspect(obj[key], inspectOptions)}`)
      .join(', ')
    return `${type}(${objStr})`
  }
})
NO_OP[customInspectSymbol] = () => 'NoOp'
