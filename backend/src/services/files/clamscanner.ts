import ClamScan from 'clamscan'

import type { Application } from '../../declarations'
import { logger } from '../../logger'

export class ClamScanner {
  scannerPromise?: Promise<ClamScan>

  constructor(public app: Application) {
    const options = app.get('clamav')
    if (options) {
      const type = 'socket' in options ? 'socket' : 'TCP'
      logger.info(`ClamAV: configuring with ${type}`)
      this.scannerPromise = new ClamScan().init({
        clamdscan: {
          ...options,
          multiscan: true,
        }
      })
      this.scannerPromise
        .then(clamAV => clamAV.getVersion())
        .then(version => logger.info(`ClamAV: version is ${version}`))
    } else {
      logger.warn("ClamAV: not configured")
    }
  }

  async isInfected(path: string) {
    // Default to letting everything pass
    if (!this.scannerPromise) return false

    const scanner = await this.scannerPromise
    const { isInfected } = await scanner.scanFile(path)
    return isInfected
  }
}

