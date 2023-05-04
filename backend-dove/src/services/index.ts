import { workshops } from './workshops/workshops'
import { events } from './events/events'
import { dances } from './dances/dances'
// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html#configure-functions
import type { Application } from '../declarations'

export const services = (app: Application) => {
  app.configure(workshops)
  app.configure(events)
  app.configure(dances)
  // All services will be registered here
}
