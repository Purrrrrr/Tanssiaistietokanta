import { addGlobalLoadingAnimation } from 'backend'
import { useDeleteDocument } from 'services/documents'

import { ButtonProps } from 'libraries/ui'
import { DeleteButton } from 'components/widgets/DeleteButton'
import { useT } from 'i18n'

interface DeleteDocumentButtonProps extends ButtonProps {
  documentId: string
  text?: string
  onDelete?: () => void
  iconOnly?: boolean
}

export function DeleteDocumentButton({ documentId, ...props }: DeleteDocumentButtonProps) {
  const t = useT('components.documents.DeleteDocumenButton')
  const [deleteDocument] = useDeleteDocument()

  return <DeleteButton
    text={t('deleteDocument')}
    {...props}
    requireRight="documents:list"
    entityId={documentId}
    confirmText={t('deleteConfirmation')}
    onDelete={() => addGlobalLoadingAnimation(deleteDocument({ id: documentId })).then(props.onDelete)}
  />
}
