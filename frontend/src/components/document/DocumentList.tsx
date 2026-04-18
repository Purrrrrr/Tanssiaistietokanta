import { useState } from 'react'

import { DocumentListItem as Document, DocumentOwner } from 'types'

import { useDocuments } from 'services/documents'

import { useRight } from 'libraries/access-control'
import { DocumentViewer } from 'libraries/lexical/DocumentViewer'
import { Button, ButtonProps, ItemList } from 'libraries/ui'
import { ChevronDown, ChevronUp, Edit } from 'libraries/ui/icons'
import { DeleteDocumentButton } from 'components/document/DeleteDocumentButton'
import { useT, useTranslation } from 'i18n'

interface DocumentListProps {
  owner: DocumentOwner
  owningId: string
  renderName?: (document: Document) => React.ReactNode
  renderEditLink?: (props: { document: Document } & Pick<ButtonProps, 'minimal' | 'color' | 'icon' | 'aria-label'>) => React.ReactNode
}

export function DocumentList({ owner, owningId, ...rest }: DocumentListProps) {
  const t = useT('components.documents.DocumentList')
  const [documents = []] = useDocuments({ owner, owningId })

  return <ItemList
    items={documents}
    emptyText={t('noDocuments')}
    columns="grid-cols-[1fr_max-content]"
  >
    {documents.map(doc => <DocumentRow key={doc._id} document={doc} {...rest} />)}
  </ItemList>
}

interface DocumentRowProps extends Pick<DocumentListProps, 'renderName' | 'renderEditLink'> {
  document: Document
}

function DocumentRow({ document, renderName, renderEditLink }: DocumentRowProps) {
  const t = useT('components.documents.DocumentList')
  const [isOpen, setIsOpen] = useState(false)
  const canEdit = useRight('documents:modify', { entityId: document._id })

  return <ItemList.Row
    expandableContent={<DocumentViewer document={document.content} />}
    expandableContentLoadingMessage={useTranslation('common.loadingEditor')}
    isOpen={isOpen}
  >
    {renderName ? renderName(document) : <span className="py-1">{document.title}</span>}
    <div className="flex gap-1">
      <DeleteDocumentButton documentId={document._id} minimal iconOnly />
      {canEdit && renderEditLink?.({
        document,
        minimal: true,
        icon: <Edit />,
        color: 'primary',
        'aria-label': t('editDocument'),
      })}
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
