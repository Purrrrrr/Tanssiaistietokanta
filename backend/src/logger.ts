// For more information about this file see https://dove.feathersjs.com/guides/cli/logging.html
import { MESSAGE } from 'triple-beam'
import { createLogger, format, transports } from 'winston'
import {
  bold,
  red,
  redBright,
  yellow,
  blueBright,
  magentaBright,
  magenta,
  type Color,
} from 'colorette'
import { isString, omit } from 'es-toolkit'
import { formatValue } from './utils/colorized-json'

function indent(str: string): string {
  const indentation = ' '.repeat(2)
  return str.replaceAll(/^/gm, indentation)
}

function formatObject(obj: any): string {
  const data = omit(obj, ['message', 'level'])
  const validKeys = Object.entries(data).filter(([k, v]) => v !== undefined && typeof k !== 'symbol')
  if (validKeys.length === 0) return ''
  return formatValue(data)
}

const levelColors: Record<string, Color> = {
  error: redBright,
  warn: yellow,
  info: blueBright,
  debug: magentaBright,
  default: String,
}

const levelFormatter = (level: string, uppercase: boolean) => {
  const colorizeLevel = levelColors[level] ?? levelColors['default']
  return bold(colorizeLevel(uppercase ? level.toUpperCase() : level))
}

const cliJson = format((info) => {
  const { provider = 'internal', level, message, errorStack, messages, durationMs, method, path, timestamp, ...rest } = info
  const msgStr = typeof message === 'string' ? message : formatValue(message as string | object)
  const ts = timestamp ?? new Date().toISOString()
  const durationStr =  durationMs ?  ` (${bold(`${durationMs}ms`)})` : ''
  let msg = `${ts} ${levelFormatter(level, true)}: ${bold(magenta(provider as string))} -> ${bold(msgStr)}${durationStr}`

  const json = formatObject(rest)
  if (json) msg += ' '+indent(json).trimStart()

  if (Array.isArray(info.messages)) {
    const messages = info.messages
      .map(subInfo => {
        const { time, timestamp, ...json } = subInfo
        return `${bold(`+${time}ms`.padEnd(8))} ${levelFormatter(subInfo.level, false)}: ${subInfo.message} ${indent(formatObject(json)).trimStart()}`
      })
    msg += `\n${messages.map(indent).join('\n')}`
  }
  if (errorStack) {
    msg += `\n${bold('  Stack trace:')} ${red(errorStack as string)}`
  }

  info[MESSAGE] = msg
  return info
})

// Configure the Winston logger. For the complete documentation see https://github.com/winstonjs/winston
export const logger = createLogger({
  // To see more detailed errors, change this to 'debug'
  level: 'debug',
  exitOnError: false,
  transports: [
    new transports.Console({
      handleExceptions: true,
      handleRejections: true,
      format: format.combine(format.splat(), cliJson()),
    }),
    new transports.File({
      filename: 'logs/requests.json',
      level: 'info',
      format: format.combine(format.splat(), format.json()),
    }),
  ]
})
