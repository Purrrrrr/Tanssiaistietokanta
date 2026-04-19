import { createFileRoute } from '@tanstack/react-router'

import { useDocument } from 'services/documents'

import { DocumentViewer } from 'libraries/lexical/DocumentViewer'
import { Edit } from 'libraries/ui/icons'
import { DeleteDocumentButton } from 'components/document/DeleteDocumentButton'
import { NavigateButton } from 'components/widgets/NavigateButton'
import { PageSection } from 'components/widgets/PageSection'
import { useT } from 'i18n'

export const Route = createFileRoute(
  '/events/$eventId/{-$eventVersionId}/documents/$documentId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const params = Route.useParams()
  const t = useT('routes.events.event.documents.document')
  const result = useDocument({ id: params.documentId })
  if (!result.data?.document) return null
  const { document } = result.data

  return <PageSection
    title={document.title}
    toolbar={
      <>
        <NavigateButton
          minimal
          color="primary"
          to="/events/$eventId/{-$eventVersionId}/documents/$documentId/edit"
          params={params}
          icon={<Edit />}
          text={t('editDocument')}
        />
        <DeleteDocumentButton minimal documentId={document._id} />
      </>
    }
  >
    <DocumentViewer document={document.content} />
  </PageSection>
}
