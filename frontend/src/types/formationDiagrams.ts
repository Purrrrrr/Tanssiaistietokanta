import { GetFormationDiagramQuery } from './gql/graphql'

export type FormationDiagram = GetFormationDiagramQuery['formationDiagram']
export type EditableFormationDiagram = Pick<FormationDiagram, 'description' | 'ballroom' | 'diagram'>
