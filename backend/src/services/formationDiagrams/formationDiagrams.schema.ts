// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { FormationDiagramService } from './formationDiagrams.class'
import { Id } from '../../utils/common-types'

// Main data model schema
export const formationDiagramSchema = Type.Object(
  {
    _id: Id(),
    _versionNumber: Type.Number(),
    _versionId: Id(),
    _updatedAt: Type.String(),
    _createdAt: Type.String(),
    ballroomId: Id(),
    description: Type.String(),
    diagram: Type.Object({}, { additionalProperties: true }),
  },
  { $id: 'FormationDiagram', additionalProperties: false },
)
export type FormationDiagram = Static<typeof formationDiagramSchema>
export const formationDiagramValidator = getValidator(formationDiagramSchema, dataValidator)
export const formationDiagramResolver = resolve<FormationDiagram, HookContext<FormationDiagramService>>({})

export const formationDiagramExternalResolver = resolve<
  FormationDiagram,
  HookContext<FormationDiagramService>
>({})

// Schema for creating new entries
export const formationDiagramDataSchema = Type.Pick(formationDiagramSchema, ['ballroomId', 'description', 'diagram'], {
  $id: 'FormationDiagramData',
})
export type FormationDiagramData = Static<typeof formationDiagramDataSchema>
export const formationDiagramDataValidator = getValidator(formationDiagramDataSchema, dataValidator)
export const formationDiagramDataResolver = resolve<FormationDiagram, HookContext<FormationDiagramService>>(
  {},
)

// Schema for updating existing entries
export const formationDiagramPatchSchema = Type.Partial(formationDiagramSchema, {
  $id: 'FormationDiagramPatch',
})
export type FormationDiagramPatch = Static<typeof formationDiagramPatchSchema>
export const formationDiagramPatchValidator = getValidator(formationDiagramPatchSchema, dataValidator)
export const formationDiagramPatchResolver = resolve<FormationDiagram, HookContext<FormationDiagramService>>(
  {},
)

// Schema for allowed query properties
export const formationDiagramQueryProperties = Type.Pick(formationDiagramSchema, ['_id', '_versionId', '_versionNumber', '_createdAt', '_updatedAt', 'ballroomId', 'description', 'diagram'])
export const formationDiagramQuerySchema = Type.Intersect(
  [
    querySyntax(formationDiagramQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false }),
  ],
  { additionalProperties: false },
)
export type FormationDiagramQuery = Static<typeof formationDiagramQuerySchema>
export const formationDiagramQueryValidator = getValidator(formationDiagramQuerySchema, queryValidator)
export const formationDiagramQueryResolver = resolve<
  FormationDiagramQuery,
  HookContext<FormationDiagramService>
>({})
