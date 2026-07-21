// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { Params } from '@feathersjs/feathers'

import type { Application } from '../../declarations'
import type {
  FormationDiagram,
  FormationDiagramData,
  FormationDiagramPatch,
  FormationDiagramQuery,
} from './formationDiagrams.schema'
import VersioningNeDBService from '../../utils/VersioningNeDBService'

export type { FormationDiagram, FormationDiagramData, FormationDiagramPatch, FormationDiagramQuery }

export interface FormationDiagramServiceOptions {
  app: Application
}

export interface FormationDiagramParams extends Params<FormationDiagramQuery> {}

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class FormationDiagramService<ServiceParams extends FormationDiagramParams = FormationDiagramParams>
  extends VersioningNeDBService<FormationDiagram, FormationDiagramData, ServiceParams, FormationDiagramPatch> {
  constructor(public options: FormationDiagramServiceOptions) {
    super({ ...options, dbname: 'formationDiagrams' })
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
