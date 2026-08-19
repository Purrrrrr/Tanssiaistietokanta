import { getRouteApi } from '@tanstack/react-router'

import { DocumentListItem as Document, DocumentOwner } from 'types'

import { useDocuments } from 'services/documents'

import { DocumentViewer } from 'libraries/lexical'
import { ButtonProps, ItemList2, Link, PageSection } from 'libraries/ui'
import { Edit } from 'libraries/ui/icons'
import { DeleteDocumentButton } from 'components/document/DeleteDocumentButton'
import { NavigateButton } from 'components/widgets/NavigateButton'
import { useT } from 'i18n'

import { CreateDocumentButton } from './CreateDocumentButton'
import { documentListRoute, documentViewRoute } from './linkUtils'

interface DocumentListProps {
  title: string
  owner: DocumentOwner
  owningId: string
  renderName?: (document: Document) => React.ReactNode
  renderEditLink?: (props: { document: Document } & Pick<ButtonProps, 'minimal' | 'color' | 'icon' | 'aria-label'>) => React.ReactNode
}

export function DocumentList({ title, owner, owningId }: DocumentListProps) {
  const t = useT('components.documents.DocumentList')
  const [documents] = useDocuments({ owner, owningId })
  const viewRoute = documentViewRoute({ owner })
  const route = documentListRoute({ owner })
  const params = getRouteApi(route).useParams()

  return <PageSection
    title={title}
    toolbar={<CreateDocumentButton owner={owner} owningId={owningId} />}
  >
    <ItemList2
      items={documents}
      emptyText={t('noDocuments')}
      expandableContent={document => <DocumentViewer document={document.content} className="border-t border-stone-300 p-4 bg-white" />}
      expandButtonProps={(_, { expanded }) => ({
        'aria-label': t(expanded ? 'closePreview' : 'previewDocument'),
        tooltip: t(expanded ? 'closePreview' : 'previewDocument'),
        color: 'primary',
      })}
      labelTranslator={useT('domain.document')}
      columns={[
        {
          key: 'title',
          width: '1fr',
          content: document => <Link to={viewRoute} params={{ documentId: document._id, ...params }}>
            {document.title}
          </Link>,
        },
      ]}
      actions={document => <>
        <DeleteDocumentButton document={document} minimal iconOnly />
        <NavigateButton
          requireRight="documents:modify"
          entityId={document._id}
          minimal
          icon={<Edit />}
          to={`${viewRoute}/edit`}
          params={{ ...params, documentId: document._id }}
          aria-label={t('editDocument')}
          color="primary"
        />
      </>}
    />
  </PageSection>
}
