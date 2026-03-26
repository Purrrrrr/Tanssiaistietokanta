import { MigrationFn } from '../../src/umzug.context'
import { danceFileFixture, limitedEventFileFixture, initTestFiles, publicEventFileFixture, createTestUpload } from '../fixtures/test-files'
import type { FileFixture } from '../fixtures/test-files'
import type { FileService } from '../../src/services/files/files.class'
import type { File as FileRecord } from '../../src/services/files/files.schema'
import { SkipAccessControl } from '../../src/services/access/hooks'

async function insertFileRecord(fileService: FileService, fixture: FileFixture): Promise<FileRecord> {
  const { owner, owningId, path, name } = fixture

  const record = await fileService.create({
    owner,
    owningId,
    path,
    notes: '',
    upload: createTestUpload(name) as any,
  }, { [SkipAccessControl]: true }) as FileRecord

  return record as unknown as FileRecord
}

export const up: MigrationFn = async params => {
  const { getService } = params.context
  const fileService = getService('files') as unknown as FileService
  await fileService.setup()

  initTestFiles()

  const [danceFile, publicEventFile, limitedEventFile] = await Promise.all([
    insertFileRecord(fileService, danceFileFixture),
    insertFileRecord(fileService, publicEventFileFixture),
    insertFileRecord(fileService, limitedEventFileFixture),
  ])

  danceFileFixture._id = danceFile._id
  publicEventFileFixture._id = publicEventFile._id
  limitedEventFileFixture._id = limitedEventFile._id
}

export const down: MigrationFn = async () => {}
