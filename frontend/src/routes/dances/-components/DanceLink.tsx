import { Dance, ID } from 'types'

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
  const danceId = 'id' in props ? props.id : props.dance._id
  const versionId = ('id' in props ? props.versionId : props.dance._versionId) ?? undefined

  return <Link to="/dances/$danceId" params={{ danceId }} search={{ versionId }}>
    {props.children ?? ('dance' in props && props.dance.name)}
  </Link>
}

export function danceVersionLink(id: ID, versionId?: ID | null) {
  return versionId
    ? `/dances/${id}/version/${versionId}`
    : `/dances/${id}`
}
