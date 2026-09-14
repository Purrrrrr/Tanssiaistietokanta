import { DocumentOwner } from 'types'

import { addGlobalLoadingAnimation } from 'backend'
import { useCreateDocument } from 'services/documents'

import { ButtonProps } from 'libraries/ui'
import { AddButton } from 'components/widgets/AddButton'
import { useT } from 'i18n'

interface CreateDocumentButtonProps extends ButtonProps {
  owner: DocumentOwner
  owningId: string
  onCreate?: (documentId: string) => void
}

export function CreateDocumentButton({ owner, owningId, onCreate, ...props }: CreateDocumentButtonProps) {
  const t = useT('components.documents.CreateDocumenButton')
  const [createDocument] = useCreateDocument()

  const handleCreate = async () => {
    const doc = await addGlobalLoadingAnimation(createDocument({ owner, owningId, title: t('untitledDocument') }))
    if (doc.data) {
      onCreate?.(doc.data.createDocument._id)
    }
  }

  return <AddButton
    requireRight="documents:create"
    owner={owner}
    owningId={owningId}
    onClick={handleCreate}
    text={t('createDocument')}
    {...props}
  />
}
