import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import { computedProperties, Id, Name } from '../../utils/common-types'

export const ballroomsSchema = Type.Object(
  {
    _id: Id(),
    _versionNumber: Type.Number(),
    _versionId: Id(),
    _updatedAt: Type.String(),
    _createdAt: Type.String(),
    venueName: Name(),
    roomName: Type.Optional(Type.String()),
    map: Type.Object({}, { additionalProperties: true }),
  },
  { $id: 'Ballrooms', additionalProperties: false },
)
export type Ballrooms = Static<typeof ballroomsSchema>
export const ballroomsValidator = getValidator(ballroomsSchema, dataValidator)
export const ballroomsResolver = resolve<Ballrooms, HookContext>({
  map: value => value ?? {},
})

export const ballroomsExternalResolver = resolve<Ballrooms, HookContext>({})

export const ballroomsDataSchema = Type.Intersect(
  [
    Type.Pick(ballroomsSchema, ['venueName']),
    Type.Partial(Type.Omit(ballroomsSchema, [...computedProperties, 'venueName'])),
  ],
  { $id: 'BallroomsData' },
)
export type BallroomsData = Static<typeof ballroomsDataSchema>
export const ballroomsDataValidator = getValidator(ballroomsDataSchema, dataValidator)
export const ballroomsDataResolver = resolve<Ballrooms, HookContext>({
  map: value => value ?? {},
})

export const ballroomsPatchSchema = Type.Partial(ballroomsSchema, {
  $id: 'BallroomsPatch',
})
export type BallroomsPatch = Static<typeof ballroomsPatchSchema>
export const ballroomsPatchValidator = getValidator(ballroomsPatchSchema, dataValidator)
export const ballroomsPatchResolver = resolve<Ballrooms, HookContext>({})

export const ballroomsQueryProperties = ballroomsSchema
export const ballroomsQuerySchema = Type.Intersect(
  [
    querySyntax(ballroomsQueryProperties),
    Type.Object({
      searchVersions: Type.Optional(Type.Boolean()),
      atDate: Type.Optional(Type.String()),
    }, { additionalProperties: false }),
  ],
  { additionalProperties: false },
)
export type BallroomsQuery = Static<typeof ballroomsQuerySchema>
export const ballroomsQueryValidator = getValidator(ballroomsQuerySchema, queryValidator)
export const ballroomsQueryResolver = resolve<BallroomsQuery, HookContext>({})
