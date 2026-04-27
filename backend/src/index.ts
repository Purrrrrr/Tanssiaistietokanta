import { app, initializeAppDependencies } from './app'
import { logger } from './logger'

console.log('')
console.log('╔═══════════════════════════════╗')
console.log('║                               ║')
console.log('║   ♪♫  Tanssiaistietokanta 💃  ║')
console.log('║                               ║')
console.log('║      Starting server...       ║')
console.log('║                               ║')
console.log('╚═══════════════════════════════╝')
console.log('')

const port = app.get('port')

process.on('unhandledRejection', (reason) => logger.error('Unhandled Rejection %O', reason))

initializeAppDependencies().then(() => {
  app.listen(port).then(() => {})
})
