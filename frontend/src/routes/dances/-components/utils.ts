import { ID } from 'types'

export function danceVersionLink(id: ID, versionId?: ID | null) {
  return versionId
    ? `/dances/${id}/version/${versionId}`
    : `/dances/${id}`
}
