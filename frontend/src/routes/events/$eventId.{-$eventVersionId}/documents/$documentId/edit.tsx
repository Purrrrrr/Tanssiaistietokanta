import { createFileRoute } from '@tanstack/react-router'
import { useCallback } from 'react'

import { useDocument, usePatchDocument } from 'services/documents'

import { formFor, patchStrategy, SyncStatus, useAutosavingState } from 'libraries/forms'
import { Editor, MinifiedEditorState } from 'libraries/lexical'
import { H2 } from 'libraries/ui'
import { EyeOpen } from 'libraries/ui/icons'
import { DeleteDocumentButton } from 'components/document/DeleteDocumentButton'
import { NavigateButton } from 'components/widgets/NavigateButton'
import { PageSection } from 'components/widgets/PageSection'
import { useT } from 'i18n'

export const Route = createFileRoute(
  '/events/$eventId/{-$eventVersionId}/documents/$documentId/edit',
)({
  component: RouteComponent,
  staticData: {
    breadcrumb: 'routes.events.event.documents.document.edit.breadcrumb',
  },
})

interface DocumentData {
  title: string
  content?: MinifiedEditorState | null
}

const { Form, Input, Field } = formFor<DocumentData>()

function RouteComponent() {
  const { documentId } = Route.useParams()
  const result = useDocument({ id: documentId })
  if (!result.data?.document) return null
  const { document } = result.data

  return <DocumentEditorInner document={document} />
}

interface DocumentRecord {
  _id: string
  title: string
  content?: MinifiedEditorState | null
}

function DocumentEditorInner({ document }: { document: DocumentRecord }) {
  const params = Route.useParams()
  const t = useT('routes.events.event.documents.document.edit')
  const label = useT('domain.document')
  const [patchDocument] = usePatchDocument()
  const save = useCallback(
    (patch: unknown[]) => patchDocument({ id: document._id, document: patch }),
    [patchDocument, document._id],
  )
  const { formProps, state } = useAutosavingState<DocumentData, unknown[]>(document, save, patchStrategy.jsonPatch)

  return <PageSection
    title={document.title}
    syncStatus={state}
    toolbar={
      <>
        <NavigateButton
          minimal
          to="/events/$eventId/{-$eventVersionId}/documents/$documentId"
          params={params}
          icon={<EyeOpen />}
          text={t('viewDocument')}
        />
        <DeleteDocumentButton minimal documentId={document._id} />
      </>
    }
  >
    <Form {...formProps}>
      <Input path="title" label={label('title')} />
      <Field path="content" label={label('content')} component={Editor} />
    </Form>
  </PageSection>
}
