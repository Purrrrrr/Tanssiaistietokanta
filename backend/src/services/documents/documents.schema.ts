import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { DocumentsService } from './documents.class'
import { Id } from '../../utils/common-types'

const owningServiceSchema = Type.Union([
  Type.Literal('dances'),
  Type.Literal('events'),
  Type.Literal('workshops'),
])
const owningIdSchema = Type.String({ minLength: 1, pattern: '^[^/]+$' })

// Main data model schema
export const documentSchema = Type.Object(
  {
    _id: Id(),
    _versionId: Id(),
    _versionNumber: Type.Number(),
    _createdAt: Type.String(),
    _updatedAt: Type.String(),
    owner: owningServiceSchema,
    owningId: owningIdSchema,
    root: Type.String(),
    path: Type.String(),
    title: Type.String(),
    content: Type.Unknown(),
  },
  { $id: 'Document', additionalProperties: false },
)

export type Document = Static<typeof documentSchema>
export type DocumentRecord = Document // For GraphQL resolver types, avoiding conflict with DOM Document
export const documentValidator = getValidator(documentSchema, dataValidator)
export const documentResolver = resolve<Document, HookContext<DocumentsService>>({})
export const documentExternalResolver = resolve<Document, HookContext<DocumentsService>>({})

// Schema for creating new entries
export const documentDataSchema = Type.Object(
  {
    owner: owningServiceSchema,
    owningId: owningIdSchema,
    path: Type.Optional(Type.String()),
    title: Type.String({ minLength: 1 }),
    content: Type.Optional(Type.Unknown()),
  },
  { $id: 'DocumentData', additionalProperties: false },
)
export type DocumentData = Static<typeof documentDataSchema>
export const documentDataValidator = getValidator(documentDataSchema, dataValidator)
export const documentDataResolver = resolve<Document, HookContext<DocumentsService>>({})

// Schema for updating existing entries
export const documentPatchSchema = Type.Partial(
  Type.Omit(documentSchema, ['_id', '_versionId', '_versionNumber', '_createdAt', '_updatedAt', 'root']),
  { $id: 'DocumentPatch' },
)
export type DocumentPatch = Static<typeof documentPatchSchema>
export const documentPatchValidator = getValidator(documentPatchSchema, dataValidator)
export const documentPatchResolver = resolve<Document, HookContext<DocumentsService>>({})

// Schema for allowed query properties
export const documentQueryProperties = Type.Omit(documentSchema, ['content', '_versionNumber'])
export const documentQuerySchema = Type.Intersect(
  [
    querySyntax(documentQueryProperties),
    Type.Object({
      searchVersions: Type.Optional(Type.Boolean()),
      atDate: Type.Optional(Type.String()),
    }, { additionalProperties: false }),
  ],
  { additionalProperties: false },
)
export type DocumentQuery = Static<typeof documentQuerySchema>
export const documentQueryValidator = getValidator(documentQuerySchema, queryValidator)
export const documentQueryResolver = resolve<DocumentQuery, HookContext<DocumentsService>>({})
