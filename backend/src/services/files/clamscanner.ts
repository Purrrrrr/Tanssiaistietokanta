import ClamScan from 'clamscan'

import type { Application } from '../../declarations'
import { logger } from '../../requestLogger'
import { ApplicationConfiguration } from '../../configuration'

export class ClamScanner {
  initialized = false
  scanner?: ClamScan
  options: ApplicationConfiguration['clamav']

  constructor(public app: Application) {
    this.options = app.get('clamav')
  }

  async init() {
    const options = this.options
    if (options) {
      const type = 'socket' in options ? 'socket' : 'TCP'
      logger.info(`ClamAV: configuring with ${type}`)
      const scanner = new ClamScan()
      this.scanner = scanner
      try {
        await scanner.init({
          clamdscan: {
            ...options,
            multiscan: true,
          },
        })
        const version = await scanner.getVersion()
        logger.info(`ClamAV: version is ${version}`)
        this.initialized = true
      } catch (error) {
        logger.error(`ClamAV: unable to initialize ClamAV because of '${error}'`)
      }
    } else {
      logger.warn('ClamAV: not configured')
    }
  }

  async isInfected(path: string) {
    // Default to letting everything pass
    if (!this.initialized) {
      logger.error('ClamAV: not initialized')
      return true
    }
    if (!this.scanner) {
      logger.warn('Unable to scan a file without ClamAV configured')
      return false
    }

    try {
      const { isInfected } = await this.scanner.scanFile(path)
      return isInfected
    } catch (_) {
      logger.warn('Unable to scan a file without a working ClamAV connection')
      return true
    }
  }
}
