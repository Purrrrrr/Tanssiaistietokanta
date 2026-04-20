import { Document } from 'types'

export function documentListRoute(document: Document) {
  switch (document.owner) {
    case 'events':
      return '/events/$eventId/{-$eventVersionId}' as const
    case 'workshops':
      return '/events/$eventId/{-$eventVersionId}/workshops/$workshopId' as const
    case 'dances':
    default:
      throw new Error(`Unknown document owner: ${document.owner}`)
  }
}

export function documentViewRoute(document: Document) {
  switch (document.owner) {
    case 'events':
      return '/events/$eventId/{-$eventVersionId}/documents/$documentId' as const
    case 'workshops':
      return '/events/$eventId/{-$eventVersionId}/workshops/$workshopId/documents/$documentId' as const
    case 'dances':
    default:
      throw new Error(`Unknown document owner: ${document.owner}`)
  }
}
