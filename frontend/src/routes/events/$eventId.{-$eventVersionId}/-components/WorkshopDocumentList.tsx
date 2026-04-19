import { getRouteApi } from '@tanstack/react-router'

import { Link } from 'libraries/ui'
import { DocumentList } from 'components/document/DocumentList'
import { NavigateButton } from 'components/widgets/NavigateButton'
import { useT } from 'i18n'

export function WorkshopDocumentList() {
  const params = getRouteApi('/events/$eventId/{-$eventVersionId}/workshops/$workshopId').useParams()
  const t = useT('routes.events.event.documents')

  return <DocumentList
    title={t('title')}
    owner="workshops"
    owningId={params.workshopId}
    renderName={doc =>
      <Link to="/events/$eventId/{-$eventVersionId}/documents/$documentId" params={{ documentId: doc._id, ...params }}>
        {doc.title}
      </Link>
    }
    renderEditLink={({ document, ...buttonProps }) =>
      <NavigateButton
        to="/events/$eventId/{-$eventVersionId}/documents/$documentId/edit"
        params={{ documentId: document._id, ...params }}
        {...buttonProps}
      />
    }
  />
}
