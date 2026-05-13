import { getRouteApi } from '@tanstack/react-router'

import { Link } from 'libraries/ui'

interface WorkshopLinkProps {
  workshop: { _id: string, name: string }
  text?: React.ReactNode
}

export function WorkshopLink({ workshop, text }: WorkshopLinkProps) {
  const params = getRouteApi('/events/$eventId/{-$eventVersionId}').useParams()
  return <Link to="/events/$eventId/{-$eventVersionId}/workshops/$workshopId" params={{ ...params, workshopId: workshop._id }}>
    {text ?? workshop.name}
  </Link>
}
