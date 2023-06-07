// For more information about this file see https://dove.feathersjs.com/guides/cli/logging.html
import { createLogger, format, transports } from 'winston'

// Configure the Winston logger. For the complete documentation see https://github.com/winstonjs/winston
export const logger = createLogger({
  // To see more detailed errors, change this to 'debug'
  level: 'debug',
  exitOnError: false,
  format: format.combine(format.prettyPrint(), format.splat(), format.simple()),
  transports: [new transports.Console({
    handleExceptions: true,
    handleRejections: true,
  })]
})
