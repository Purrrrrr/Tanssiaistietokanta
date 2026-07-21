import { backendQueryHook, entityCreateHook, entityDeleteHook, entityListQueryHook, entityUpdateHook, graphql, setupServiceUpdateFragment } from '../backend'

setupServiceUpdateFragment(
  'formationDiagrams',
  `fragment FormationDiagramFragment on FormationDiagram {
    _id
    _versionId
    _versionNumber
    _updatedAt
    ballroomId
    description
    diagram
  }`,
)

export const useFormationDiagrams = entityListQueryHook('formationDiagrams', graphql(`
query getFormationDiagrams {
  formationDiagrams {
    _id
    _versionId
    _versionNumber
    _updatedAt
    ballroomId
    ballroom {
      _id
      venueName
      roomName
      map
    }
    description
    diagram
  }
}`))

export const useFormationDiagram = backendQueryHook(graphql(`
query getFormationDiagram($id: ID!) {
  formationDiagram(id: $id) {
    _id
    _versionId
    _versionNumber
    _updatedAt
    ballroomId
    ballroom {
      _id
      venueName
      roomName
      map
    }
    description
    diagram
  }
}`))

export const useCreateFormationDiagram = entityCreateHook('formationDiagrams', graphql(`
mutation createFormationDiagram($formationDiagram: FormationDiagramInput!) {
  createFormationDiagram(formationDiagram: $formationDiagram) {
    _id
    _versionId
    _versionNumber
    _updatedAt
    ballroomId
    ballroom {
      _id
      venueName
      roomName
      map
    }
    description
    diagram
  }
}`))

export const usePatchFormationDiagram = entityUpdateHook('formationDiagrams', graphql(`
mutation patchFormationDiagram($id: ID!, $formationDiagram: JSONPatch!) {
  patchFormationDiagram(id: $id, formationDiagram: $formationDiagram) {
    _id
    _versionId
    _versionNumber
    _updatedAt
    ballroomId
    ballroom {
      _id
      venueName
      roomName
      map
    }
    description
    diagram
  }
}`))

export const useDeleteFormationDiagram = entityDeleteHook('formationDiagrams', graphql(`
mutation deleteFormationDiagram($id: ID!) {
  deleteFormationDiagram(id: $id) {
    _id
    _versionId
    _versionNumber
    _updatedAt
    ballroomId
    ballroom {
      _id
      venueName
      roomName
      map
    }
    description
    diagram
  }
}`))
