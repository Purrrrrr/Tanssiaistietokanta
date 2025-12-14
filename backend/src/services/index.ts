import { file } from './files/files'
import { dancewiki } from './dancewiki/dancewiki'
import { graphql } from './graphql/graphql'
import { channelConnections } from './channel-connections/channel-connections'
import { convert } from './convert/convert'
import { workshops } from './workshops/workshops'
import { events } from './events/events'
import { dances } from './dances/dances'
// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html#configure-functions
import type { Application } from '../declarations'

export const services = (app: Application) => {
  app.configure(file)
  app.configure(dancewiki)
  app.configure(graphql)
  app.configure(channelConnections)
  app.configure(convert)
  app.configure(workshops)
  app.configure(events)
  app.configure(dances)
  // All services will be registered here
}
