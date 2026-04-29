import { useMemo } from 'react'

import { backendQueryHook, entityCreateHook, entityDeleteHook, entityListQueryHook, entityUpdateHook, graphql, setupServiceUpdateFragment, useServiceEvents } from 'backend'

setupServiceUpdateFragment(
  'documents',
  `fragment DocumentFragment on Document {
    _id
    _versionId
    _versionNumber
    _updatedAt
    _createdAt
    owner
    owningId
    path
    title
    content
  }`,
)

export const useDocuments = entityListQueryHook('documents', graphql(`
query getDocuments($owner: DocumentOwner!, $owningId: ID!, $path: String) {
  documents(owner: $owner, owningId: $owningId, path: $path) {
    _id
    _versionId
    _updatedAt
    _createdAt
    owner
    owningId
    path
    title
    content
  }
}`))

export const useDocument = backendQueryHook(graphql(`
query getDocument($id: ID!, $versionId: ID) {
  document(id: $id, versionId: $versionId) {
    _id
    _versionId
    _versionNumber
    _updatedAt
    _createdAt
    owner
    owningId
    path
    title
    content
  }
}`), ({ refetch, variables }) => {
  if (variables === undefined) return
  useCallbackOnDocumentChanges(variables.id, refetch)
})

function useCallbackOnDocumentChanges(documentId, callback) {
  const callbacks = useMemo(() => {
    const updateFn = () => {
      // console.log('Dance has changed, running callback')
      callback()
    }
    return {
      created: updateFn,
      updated: updateFn,
      removed: updateFn,
    }
  }, [callback])
  useServiceEvents('documents', `documents/${documentId}`, callbacks)
}

export const useCreateDocument = entityCreateHook('documents', graphql(`
mutation createDocument($owner: DocumentOwner!, $owningId: ID!, $path: String, $title: String!, $content: DocumentContent) {
  createDocument(owner: $owner, owningId: $owningId, path: $path, title: $title, content: $content) {
    _id
    _versionId
    _versionNumber
    _updatedAt
    _createdAt
    owner
    owningId
    path
    title
    content
  }
}`))

export const usePatchDocument = entityUpdateHook('documents', graphql(`
mutation patchDocument($id: ID!, $document: JSONPatch!) {
  patchDocument(id: $id, document: $document) {
    _id
    _versionId
    _versionNumber
    _updatedAt
    _createdAt
    owner
    owningId
    path
    title
    content
  }
}`))

export const useDeleteDocument = entityDeleteHook('documents', graphql(`
mutation deleteDocument($id: ID!) {
  deleteDocument(id: $id) {
    _id
    _versionId
    _updatedAt
    owner
    owningId
    path
    title
  }
}`))
