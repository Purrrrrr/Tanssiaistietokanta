// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Diagram, DiagramData, DiagramQuery, DiagramService } from './diagrams.class'

export type { Diagram, DiagramData, DiagramQuery }

export type DiagramClientService = Pick<DiagramService<Params<DiagramQuery>>, (typeof diagramMethods)[number]>

export const diagramPath = 'diagrams'

export const diagramMethods: (keyof DiagramService)[] = ['get', 'create']

export const diagramClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(diagramPath, connection.service(diagramPath), {
    methods: diagramMethods,
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [diagramPath]: DiagramClientService
  }
}
