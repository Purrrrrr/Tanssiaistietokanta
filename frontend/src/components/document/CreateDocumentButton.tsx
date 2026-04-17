import { DocumentOwner } from 'types'

import { addGlobalLoadingAnimation } from 'backend'
import { useCreateDocument } from 'services/documents'

import { Button, ButtonProps } from 'libraries/ui'
import { Add } from 'libraries/ui/icons'
import { useT } from 'i18n'

interface CreateDocumentButtonProps extends ButtonProps {
  owner: DocumentOwner
  owningId: string
  onCreate?: () => void
}

export function CreateDocumentButton({ owner, owningId, onCreate, ...props }: CreateDocumentButtonProps) {
  const t = useT('components.documents.CreateDocumenButton')
  const [createDocument] = useCreateDocument()

  const handleCreate = async () => {
    await addGlobalLoadingAnimation(createDocument({ owner, owningId, title: t('untitledDocument') }))
    onCreate?.()
  }

  return <Button
    requireRight="documents:create"
    owner={owner}
    owningId={owningId}
    onClick={handleCreate}
    icon={<Add />}
    text={t('createDocument')}
    {...props}
  />
}
