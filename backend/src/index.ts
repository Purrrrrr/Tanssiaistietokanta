import { initializeApp } from './app'
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

process.on('unhandledRejection', (reason) => logger.error('Unhandled Rejection %O', reason))

initializeApp().then(() => {})
