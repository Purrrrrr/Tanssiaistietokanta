// For more information about this file see https://dove.feathersjs.com/guides/cli/logging.html
import { MESSAGE } from 'triple-beam'
import { createLogger, format, transports } from 'winston'
import { colorize } from 'json-colorizer'
import { 
  bold,
  redBright,
  yellow,
  blueBright,
  magentaBright,
  type Color,
} from 'colorette'
import { isRegExp, isString, omit } from 'es-toolkit'

function indent(str: string): string {
  const indentation = ' '.repeat(2)
  return str.replaceAll(/^/gm, indentation)
}

function formatObject(obj: any): string {
  const data = omit(obj, ['message', 'level'])
  if (Object.values(data).filter(isString).length === 0) return ''
  return colorize(JSON.stringify(data, (_: any, value: unknown) => isRegExp(value) ? String(value) : value, 2))
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
  const { level, message, errorStack, messages, durationMs, method, path, timestamp, ...rest } = info
  const msgStr = typeof message === 'string' ? message : colorize(message as string | object)
  let msg = `${timestamp ?? new Date().toISOString()} ${levelFormatter(level, true)}: ${bold(msgStr)}`
  if (durationMs !== undefined) msg += ` (${bold(`${durationMs}ms`)})`

  const json = formatObject(rest)
  if (json) msg += indent(json)

  if (Array.isArray(info.messages)) {
    const messages = info.messages
      .map(subInfo => {
        const { time, timestamp, ...json } = subInfo
        return `${bold(`+${time}ms`).padEnd(8)} ${levelFormatter(subInfo.level, false)}: ${subInfo.message} ${indent(formatObject(json))}`
      })
    msg += `\n${messages.map(indent).join('\n')}`
  }
  if (errorStack) {
    msg += `\n${bold('  Stack trace:')}\n${errorStack}`
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
      filename: 'logs/requests.log',
      level: 'info',
      format: format.combine(format.splat(), format.json()),
    }),
  ]
})
