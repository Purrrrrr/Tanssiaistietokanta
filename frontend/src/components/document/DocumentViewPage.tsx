import { getRouteApi } from '@tanstack/react-router'

import { Document } from 'types'

import { useDocument } from 'services/documents'

import { DocumentViewer } from 'libraries/lexical'
import { Edit } from 'libraries/ui/icons'
import { DeleteDocumentButton } from 'components/document/DeleteDocumentButton'
import { NavigateButton } from 'components/widgets/NavigateButton'
import { PageSection } from 'components/widgets/PageSection'
import { useT } from 'i18n'

import { documentViewRoute } from './linkUtils'

export function DocumenViewPage({ documentId }: { documentId: string }) {
  const { data } = useDocument({ id: documentId })
  if (!data?.document) return null

  return <DocumentViewPageInner document={data.document} />
}

function DocumentViewPageInner({ document }: { document: Document }) {
  const route = documentViewRoute(document)
  const params = getRouteApi(route).useParams()
  const t = useT('components.documents.DocumentViewPage')

  return <PageSection
    title={document.title}
    toolbar={
      <>
        <NavigateButton
          minimal
          color="primary"
          to={`${route}/edit`}
          params={params}
          icon={<Edit />}
          text={t('editDocument')}
        />
        <DeleteDocumentButton minimal document={document} />
      </>
    }
  >
    <DocumentViewer document={document.content} />
  </PageSection>
}
