import * as colorette from 'colorette'
import { isPlainObject } from 'es-toolkit'

export function formatValue(value: any): string {
  if (value === null) return colorette.gray('null')
  switch (typeof value) {
    case 'string':
      return formatString(value)
    case 'number':
      return formatNumber(value)
    case 'boolean':
      return colorette.cyan(value.toString())
    case 'object':
      if (Array.isArray(value)) {
        return formatArray(value)
      } else if (value instanceof RegExp) {
        return formatRegex(value)
      } else if (value instanceof Date) {
        return colorette.yellow(value.toISOString())
      } else if (isPlainObject(value)) {
        return formatObject(value)
      }
      return colorette.black(String(value))
    default:
      return colorette.gray(String(value))
  }
}

function formatArray(array: any[]): string {
  const arrayContents = array.map(v => formatValue(v))
  if (array.length >= 3 || arrayContents.some(v => v.includes('\n'))) {
    const indentedContents = arrayContents.map(v => indent(v)).join(',\n')
    return `[\n${indentedContents}\n]`
  }
  return `[${arrayContents.join(', ')}]`
}

function formatString(str: string): string {
  return colorette.green(`"${str}"`)
}

function formatNumber(number: number): string {
  return colorette.blue(number)
}

function formatRegex(regex: RegExp): string {
  return colorette.red(regex.toString())
}

function formatObject(obj: object): string {
  const entries = Object.entries(obj)
    .filter(([k, v]) => typeof k !== 'symbol' && v !== undefined)
  if (entries.length === 0) return colorette.yellow('{}')

  if (entries.length === 1) {
    const [[key, value]] = entries
    return `${formatKey(key)} = ${formatValue(value)}`
  }

  const objectContents = entries.map(([k, v]) => indent(`${formatKey(k)}: ${formatValue(v)}`)).join('\n')
  return [colorette.yellow('{'), objectContents, colorette.yellow('}')].join('\n')
}

function formatKey(key: string | number): string {
  const isValidIdentifier = typeof key === 'number' || key.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)
  const quoted = isValidIdentifier ? key : JSON.stringify(key)
  return colorette.magenta(quoted)
}

const indent = (str: string, level: number = 1): string => {
  const indentation = ' '.repeat(level * 2)
  return str.replaceAll(/^/gm, indentation)
}
