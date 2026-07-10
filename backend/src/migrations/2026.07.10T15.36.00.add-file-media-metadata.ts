import { constants } from 'node:fs'
import { access } from 'node:fs/promises'
import { join, resolve } from 'node:path'

import { logger } from '../logger'
import { deduceMediaMetadata } from '../services/files/mediaMetadata'
import { MigrationFn } from '../umzug.context'

type FileRecord = {
  owner?: string
  owningId?: string
  fileId?: string
  mimetype?: string
  mediaType?: string
  mediaFormat?: string
  mediaDurationMs?: number
  mediaWidth?: number
  mediaHeight?: number
} & Record<string, unknown>

const mediaMetadataFields = ['mediaType', 'mediaFormat', 'mediaDurationMs', 'mediaWidth', 'mediaHeight'] as const

export const up: MigrationFn = async ({ context }) => {
  const fileService = context.getService('files') as { options?: { uploadDir?: string } }
  const uploadDir = fileService.options?.uploadDir
  if (!uploadDir) {
    logger.warn('Skipping file metadata migration: files service uploadDir is unavailable')
    return
  }

  const uploadRootPath = resolve(context.rootPath, uploadDir)
  await context.updateDatabase('files', async record => await updateFileRecord(record as FileRecord, uploadRootPath))
}

export const down: MigrationFn = async () => {}

async function updateFileRecord(record: FileRecord, uploadRootPath: string): Promise<FileRecord | undefined> {
  const { owner, owningId, fileId, mimetype } = record
  if (!owner || !owningId || !fileId || !mimetype) {
    return undefined
  }

  const filePath = join(uploadRootPath, owner, owningId, fileId)
  if (!(await fileExists(filePath))) {
    return undefined
  }

  try {
    const metadata = await deduceMediaMetadata(filePath, mimetype)
    if (!hasAnyMetadataValue(metadata)) {
      return undefined
    }

    const updated = { ...record, ...metadata }
    return hasMetadataChanged(record, updated)
      ? updated
      : undefined
  } catch (error) {
    logger.warn(`Unable to migrate metadata for fileId '${fileId}': ${error}`)
    return undefined
  }
}

function hasAnyMetadataValue(record: Partial<Record<(typeof mediaMetadataFields)[number], unknown>>) {
  return mediaMetadataFields.some(field => record[field] !== undefined)
}

function hasMetadataChanged(current: FileRecord, next: FileRecord) {
  return mediaMetadataFields.some(field => current[field] !== next[field])
}

async function fileExists(path: string) {
  try {
    await access(path, constants.F_OK)
    return true
  } catch {
    return false
  }
}
