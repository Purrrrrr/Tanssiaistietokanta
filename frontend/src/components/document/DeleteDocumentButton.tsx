import { getRouteApi, useMatch, useNavigate } from '@tanstack/react-router'

import { Document } from 'types'

import { addGlobalLoadingAnimation } from 'backend'
import { useDeleteDocument } from 'services/documents'

import { ButtonProps } from 'libraries/ui'
import { DeleteButton } from 'components/widgets/DeleteButton'
import { useT } from 'i18n'

import { documentListRoute } from './linkUtils'

interface DeleteDocumentButtonProps extends ButtonProps {
  document: Pick<Document, '_id' | 'owner'>
  text?: string
  iconOnly?: boolean
}

export function DeleteDocumentButton({ document, ...props }: DeleteDocumentButtonProps) {
  const t = useT('components.documents.DeleteDocumenButton')
  const [deleteDocument] = useDeleteDocument()
  const navigate = useNavigate()
  const match = useMatch({ strict: false })
  const listRoute = documentListRoute(document)
  const params = getRouteApi(listRoute).useParams()

  return <DeleteButton
    text={t('deleteDocument')}
    {...props}
    requireRight="documents:delete"
    entityId={document._id}
    confirmText={t('deleteConfirmation')}
    onDelete={async () => {
      await addGlobalLoadingAnimation(deleteDocument({ id: document._id }))
      if ('documentId' in match.params) {
        // The current page is a document page, navigate to the list page to prevent 404 errors
        navigate({
          to: listRoute,
          params,
        })
      }
    }}
  />
}
