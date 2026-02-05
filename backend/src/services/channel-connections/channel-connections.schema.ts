// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'

// Main data model schema
export const channelConnectionsSchema = Type.String(
  { $id: 'ChannelConnections', additionalProperties: false },
)
export type ChannelConnections = Static<typeof channelConnectionsSchema>

// Schema for creating new entries
export const channelConnectionsDataSchema = Type.Object(
  {
    name: Type.String(),
  },
  { $id: 'ChannelConnectionsData', additionalProperties: false },
)
export type ChannelConnectionsData = Static<typeof channelConnectionsDataSchema>
export const channelConnectionsDataValidator = getValidator(channelConnectionsDataSchema, dataValidator)

// Schema for allowed query properties
export const channelConnectionsQuerySchema = Type.Object(
  { // Add additional query properties here
  },
  { additionalProperties: false },
)
export type ChannelConnectionsQuery = Static<typeof channelConnectionsQuerySchema>
export const channelConnectionsQueryValidator = getValidator(channelConnectionsQuerySchema, queryValidator)
export const channelConnectionsQueryResolver = resolve<ChannelConnectionsQuery, HookContext>({})
