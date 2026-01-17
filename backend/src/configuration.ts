import { Type, getValidator, defaultAppConfiguration } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import { dataValidator } from './validators'

export const configurationSchema = Type.Intersect([
  defaultAppConfiguration,
  Type.Object({
    host: Type.String(),
    port: Type.Number(),
    public: Type.String(),
    uploadTmp: Type.String(),
    uploadDir: Type.String(),
    clamav: Type.Optional(Type.Union([
      Type.Object({
        socket: Type.Optional(Type.String()),
      }),
      Type.Object({
        host: Type.Optional(Type.String()),
        port: Type.Optional(Type.Number()),
      })
    ])),
  })
])

export type ApplicationConfiguration = Static<typeof configurationSchema> & {
  instanceId: string
  importExtension: string
  authentication: {
    refreshTokenOptions: {
      expiresIn: string
    }
  }
}

export const configurationValidator = getValidator(configurationSchema, dataValidator)
