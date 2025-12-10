// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { FileService } from './files.class'
import { Id } from '../../utils/common-types'

// Main data model schema
export const fileSchema = Type.Object(
  {
    _id: Id(),
    _createdAt: Type.String(),
    _updatedAt: Type.String(),
    root: Type.String(),
    path: Type.String(),
    name: Type.String(),
    fileId: Type.String(),
    mimetype: Type.String(),
    size: Type.Number(),
    unused: Type.Boolean({ description: 'If true, the file will be removed eventually by a scheduled job' }),
    buffer: Type.Optional(Type.Unknown())
  },
  { $id: 'File', additionalProperties: false }
)
export type File = Static<typeof fileSchema> & { buffer?: Buffer }
export const fileValidator = getValidator(fileSchema, dataValidator)
export const fileResolver = resolve<File, HookContext<FileService>>({})

export const fileExternalResolver = resolve<File, HookContext<FileService>>({})

// Schema for creating new entries
export const fileDataSchema = Type.Object(
  {
    root: Type.String(),
    path: Type.String(),
    filename: Type.Optional(Type.String({ minLength: 1 })),
    unused: Type.Optional(Type.Boolean({ description: 'If true, the file will be removed eventually by a scheduled job' })),
    upload: Type.Object(
      {
        filepath: Type.String(),
        originalFilename: Type.String(),
        mimetype: Type.String(),
        size: Type.Number(),
      },
      { $id: 'Upload', additionalProperties: true }
    ),
    autoRename: Type.Optional(Type.Union([Type.Boolean(), Type.Literal('true')],{
      description: 'If true, automatically rename file in case of file name conflicts',
    })),
  },
  { $id: 'FileData', additionalProperties: false }
)
export type FileData = Static<typeof fileDataSchema>
export const fileDataValidator = getValidator(fileDataSchema, dataValidator)
export const fileDataResolver = resolve<File, HookContext<FileService>>({})

// Schema for updating existing entries
export const filePatchSchema = Type.Partial(
  Type.Pick(fileSchema, ['path', 'name', 'unused']),
  { $id: 'FilePatch' },
)
export type FilePatch = Static<typeof filePatchSchema>
export const filePatchValidator = getValidator(filePatchSchema, dataValidator)
export const filePatchResolver = resolve<File, HookContext<FileService>>({})

// Schema for allowed query properties
export const fileQueryProperties = Type.Omit(fileSchema, ['fileId', 'buffer'])
export const fileQuerySchema = Type.Intersect(
  [
    querySyntax(fileQueryProperties),
    // Add additional query properties here
    Type.Object({
      download: Type.Optional(Type.Boolean()),
      searchVersions: Type.Optional(Type.Boolean()),
    }, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type FileQuery = Static<typeof fileQuerySchema>
export const fileQueryValidator = getValidator(fileQuerySchema, queryValidator)
export const fileQueryResolver = resolve<FileQuery, HookContext<FileService>>({})
