import { NO_OP, setOpExtra } from './types'

const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom')
setOpExtra({
  [customInspectSymbol](_depth, inspectOptions, inspect) {
    const {type, ...obj} = this
    const objStr = Object.keys(obj)
      .map(key => `${key}: ${inspect(obj[key], inspectOptions)}`)
      .join(', ')
    return `${type}(${objStr})`
  }
})
NO_OP[customInspectSymbol] = () => 'NoOp'
