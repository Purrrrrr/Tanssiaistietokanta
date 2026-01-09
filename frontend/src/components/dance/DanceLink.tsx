import { Dance } from 'types'
import { ID } from 'backend/types'

import { Link } from 'libraries/ui'

type DanceLinkProps = {
  children?: React.ReactNode
} &
({
  id: ID
  versionId?: ID
} | {
  dance: Pick<Dance, '_id' | '_versionId' | 'name'>
})

export function DanceLink(props: DanceLinkProps) {
  const link = 'id' in props
    ? danceVersionLink(props.id, props.versionId) : danceVersionLink(props.dance._id, props.dance._versionId)

  return <Link to={link}>{props.children ?? ('dance' in props && props.dance.name)}</Link>
}

export function danceVersionLink(id: ID, versionId?: ID | null) {
  return versionId
    ? `/dances/${id}/version/${versionId}`
    : `/dances/${id}`
}
