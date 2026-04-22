import { getRouteApi } from '@tanstack/react-router'
import { useState } from 'react'

import { DocumentListItem as Document, DocumentOwner } from 'types'

import { useDocuments } from 'services/documents'

import { DocumentViewer } from 'libraries/lexical'
import { Button, ButtonProps, ItemList, Link } from 'libraries/ui'
import { ChevronDown, ChevronUp, Edit } from 'libraries/ui/icons'
import { DeleteDocumentButton } from 'components/document/DeleteDocumentButton'
import { NavigateButton } from 'components/widgets/NavigateButton'
import { PageSection } from 'components/widgets/PageSection'
import { useT, useTranslation } from 'i18n'

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
  const [documents = []] = useDocuments({ owner, owningId })

  return <PageSection
    title={title}
    toolbar={<CreateDocumentButton owner={owner} owningId={owningId} />}
  >
    <ItemList
      items={documents}
      emptyText={t('noDocuments')}
      columns="grid-cols-[1fr_max-content]"
    >
      {documents.map(doc => <DocumentRow key={doc._id} document={doc} />)}
    </ItemList>
  </PageSection>
}

interface DocumentRowProps {
  document: Document
}

function DocumentRow({ document }: DocumentRowProps) {
  const route = documentListRoute(document)
  const viewRoute = documentViewRoute(document)
  const params = getRouteApi(route).useParams()
  const t = useT('components.documents.DocumentList')
  const [isOpen, setIsOpen] = useState(false)

  return <ItemList.Row
    expandableContent={<DocumentViewer document={document.content} className="border-t-1 border-stone-300 p-4 bg-white" />}
    expandableContentLoadingMessage={useTranslation('common.loadingEditor')}
    isOpen={isOpen}
  >
    <Link to={viewRoute} params={{ documentId: document._id, ...params }}>
      {document.title}
    </Link>
    <div className="flex gap-1">
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
      <Button
        minimal
        aria-label={t(isOpen ? 'closePreview' : 'previewDocument')}
        tooltip={t(isOpen ? 'closePreview' : 'previewDocument')}
        color="primary"
        onClick={() => setIsOpen(!isOpen)}
        rightIcon={isOpen ? <ChevronUp /> : <ChevronDown />}
      />
    </div>
  </ItemList.Row>
}
