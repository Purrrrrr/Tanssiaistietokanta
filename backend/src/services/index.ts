import { access } from './access/access'
import { sessions } from './sessions/sessions'
import { user } from './users/users'
import { file } from './files/files'
import { dancewiki } from './dancewiki/dancewiki'
import { graphql } from './graphql/graphql'
import { channelConnections } from './channel-connections/channel-connections'
import { convert } from './convert/convert'
import { workshops } from './workshops/workshops'
import { events } from './events/events'
import { dances } from './dances/dances'
import { volunteers } from './volunteers/volunteers'
import { eventVolunteers } from './eventVolunteers/eventVolunteers'
import { eventVolunteerAssignments } from './eventVolunteerAssignments/eventVolunteerAssignments'
import { eventRoles } from './eventRoles/eventRoles'
import { documents } from './documents/documents'
// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html#configure-functions
import type { Application } from '../declarations'

export const services = (app: Application) => {
  app.configure(access)
  app.configure(sessions)
  app.configure(user)
  app.configure(file)
  app.configure(documents)
  app.configure(dancewiki)
  app.configure(graphql)
  app.configure(channelConnections)
  app.configure(convert)
  app.configure(workshops)
  app.configure(events)
  app.configure(dances)
  app.configure(volunteers)
  app.configure(eventVolunteers)
  app.configure(eventVolunteerAssignments)
  app.configure(eventRoles)
  // All services will be registered here
}
