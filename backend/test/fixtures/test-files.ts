import { PersistentFile } from 'formidable'
import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { testDances } from './test-dances'
import { publicTestEvent, limitedTestEvent } from './test-events'

export type FileFixture = {
  _id: string
  owner: 'dances' | 'events'
  owningId: string
  path: string
  name: string
}

export const danceFileFixture: FileFixture = {
  _id: '',
  owner: 'dances',
  owningId: '',
  path: '',
  name: 'dance-test-file.txt',
}

export const publicEventFileFixture: FileFixture = {
  _id: '',
  owner: 'events',
  owningId: '',
  path: '',
  name: 'public-event-test-file.txt',
}

export const limitedEventFileFixture: FileFixture = {
  _id: '',
  owner: 'events',
  owningId: '',
  path: '',
  name: 'limited-event-test-file.txt',
}

// Owner IDs are not available at fixture definition time, so we set them in this function
export const initTestFiles = () => {
  danceFileFixture.owningId = testDances[0]._id
  publicEventFileFixture.owningId = publicTestEvent._id
  limitedEventFileFixture.owningId = limitedTestEvent._id
}

export const testFileFixtures = [danceFileFixture, publicEventFileFixture, limitedEventFileFixture] as const

// Creates a real temp file and returns a PersistentFile instance suitable for upload.
// The file is written to the upload tmp dir so fs.rename works (no cross-device move).
export function createTestUpload(filename: string, content = 'test file content') {
  const dir = join(process.cwd(), 'data-test', 'uploads', 'tmp')
  mkdirSync(dir, { recursive: true })
  const filepath = join(dir, `test-upload-${Date.now()}-${Math.random().toString(36).slice(2)}.tmp`)
  const buffer = Buffer.from(content)
  writeFileSync(filepath, buffer)
  return new PersistentFile({
    filepath,
    originalFilename: filename,
    mimetype: 'text/plain',
    size: buffer.byteLength,
  } as any)
}
