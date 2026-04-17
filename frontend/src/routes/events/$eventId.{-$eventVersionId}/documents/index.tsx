import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useState } from 'react'

import { addGlobalLoadingAnimation } from 'backend'
import { useCreateDocument, useDeleteDocument, useDocument, useDocuments, usePatchDocument } from 'services/documents'

import { formFor, patchStrategy, SyncStatus, useAutosavingState } from 'libraries/forms'
import { Editor, MinifiedEditorState } from 'libraries/lexical'
import { Button, ItemList } from 'libraries/ui'
import { ChevronDown, ChevronUp, Edit } from 'libraries/ui/icons'
import { DeleteButton } from 'components/widgets/DeleteButton'
import { useT, useTranslation } from 'i18n'

import { useCurrentEvent } from '../-context'

export const Route = createFileRoute('/events/$eventId/{-$eventVersionId}/documents/')({
  component: RouteComponent,
})

interface DocumentData {
  title: string
  content?: MinifiedEditorState | null
}

const { Form, Input } = formFor<DocumentData>()

function RouteComponent() {
  const event = useCurrentEvent()
  const t = useT('routes.events.event.documents')
  const [documents = []] = useDocuments({ owner: 'events', owningId: event._id })
  const [createDocument] = useCreateDocument()

  const handleCreate = () => {
    addGlobalLoadingAnimation(createDocument({ owner: 'events', owningId: event._id, title: t('untitledDocument') }))
  }

  return <div>
    <div className="flex justify-end mb-4">
      <Button
        requireRight="events:modify"
        entityId={event._id}
        onClick={handleCreate}
        color="primary"
        text={t('createDocument')}
      />
    </div>
    <ItemList
      items={documents}
      emptyText={t('noDocuments')}
      columns="grid-cols-[1fr_max-content]"
    >
      {documents.map(doc =>
        <DocumentRow key={doc._id} document={doc} eventId={event._id} />,
      )}
    </ItemList>
  </div>
}

interface DocumentListItem {
  _id: string
  title: string
}

function DocumentRow({ document, eventId }: { document: DocumentListItem, eventId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const t = useT('routes.events.event.documents')
  const [deleteDocument] = useDeleteDocument()

  return <ItemList.Row
    expandableContent={<DocumentEditor documentId={document._id} />}
    expandableContentLoadingMessage={useTranslation('common.loadingEditor')}
    isOpen={isOpen}
  >
    <span className="py-1">{document.title}</span>
    <div className="flex gap-1">
      <DeleteButton
        requireRight="events:modify"
        entityId={eventId}
        minimal
        iconOnly
        text={t('deleteDocument')}
        confirmText={t('deleteConfirmation')}
        onDelete={() => addGlobalLoadingAnimation(deleteDocument({ id: document._id }))}
      />
      <Button
        requireRight="events:modify"
        entityId={eventId}
        minimal
        icon={<Edit />}
        aria-label={useTranslation('common.edit')}
        tooltip={useTranslation('common.edit')}
        color="primary"
        onClick={() => setIsOpen(!isOpen)}
        rightIcon={isOpen ? <ChevronUp /> : <ChevronDown />}
      />
    </div>
  </ItemList.Row>
}

function DocumentEditor({ documentId }: { documentId: string }) {
  const result = useDocument({ id: documentId })
  if (!result.data?.document) return null

  return <DocumentEditorInner document={result.data.document} />
}

interface DocumentRecord {
  _id: string
  title: string
  content?: MinifiedEditorState | null
}

function DocumentEditorInner({ document }: { document: DocumentRecord }) {
  const t = useT('routes.events.event.documents')
  const [patchDocument] = usePatchDocument()
  const save = useCallback(
    (patch: unknown[]) => patchDocument({ id: document._id, document: patch }),
    [patchDocument, document._id],
  )

  const editableDoc: DocumentData = { title: document.title, content: document.content }
  const { formProps, state } = useAutosavingState<DocumentData, unknown[]>(editableDoc, save, patchStrategy.jsonPatch)

  return <Form {...formProps} className="p-3 border-t border-gray-200">
    <SyncStatus className="mt-1" floatRight state={state} />
    <Input path="title" label={t('titleLabel')} />
    <div className="mt-3">
      <Editor
        value={formProps.value.content}
        onChange={(content) => formProps.onChange({ ...formProps.value, content }, 'content')}
      />
    </div>
  </Form>
}
