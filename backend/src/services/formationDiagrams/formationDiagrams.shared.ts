// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  FormationDiagram,
  FormationDiagramData,
  FormationDiagramPatch,
  FormationDiagramQuery,
  FormationDiagramService,
} from './formationDiagrams.class'

export type { FormationDiagram, FormationDiagramData, FormationDiagramPatch, FormationDiagramQuery }

export type FormationDiagramClientService = Pick<
  FormationDiagramService<Params<FormationDiagramQuery>>,
  (typeof formationDiagramMethods)[number]
>

export const formationDiagramPath = 'formationDiagrams'

export const formationDiagramMethods: (keyof FormationDiagramService)[] = [
  'find',
  'get',
  'create',
  'patch',
  'remove',
]

export const formationDiagramClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(formationDiagramPath, connection.service(formationDiagramPath), {
    methods: formationDiagramMethods,
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [formationDiagramPath]: FormationDiagramClientService
  }
}
