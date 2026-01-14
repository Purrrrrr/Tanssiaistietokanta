// For more information about this file see https://dove.feathersjs.com/guides/cli/logging.html
import { MESSAGE } from 'triple-beam';
import { createLogger, format, transports } from 'winston'
import { colorize } from 'json-colorizer';
import { 
  bold,
  redBright,
  yellow,
  blueBright,
  magentaBright,
  type Color,
} from 'colorette';

const levelColors: Record<string, Color> = {
  error: redBright,
  warn: yellow,
  info: blueBright,
  debug: magentaBright,
  default: String,
};

const cliJson = format((info) => {
  const { level, message, errorStack, ...rest } = info;
  const json = colorize(rest)
  const levelString = bold((levelColors[level] ?? levelColors['default'])(level.toUpperCase()))
  const msg = typeof message === 'string' ? message : colorize(message as string | object)
  info[MESSAGE] = `${levelString}: ${bold(msg)} ${json} ${errorStack ? '\n' + errorStack : ''}`;
  return info;
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
      format: cliJson(),
    }),
    new transports.File({
      filename: 'logs/requests.log',
      level: 'info',
      format: format.json(),
    }),
  ]
})
