import { getRouteApi } from '@tanstack/react-router'
import { useCallback } from 'react'

import { Document } from 'types'

import { useDocument, usePatchDocument } from 'services/documents'

import { formFor, patchStrategy, useAutosavingState } from 'libraries/forms'
import { Editor, MinifiedEditorState } from 'libraries/lexical'
import { EyeOpen } from 'libraries/ui/icons'
import { DeleteDocumentButton } from 'components/document/DeleteDocumentButton'
import { NavigateButton } from 'components/widgets/NavigateButton'
import { PageSection } from 'components/widgets/PageSection'
import { useT } from 'i18n'

import { documentViewRoute } from './linkUtils'

interface DocumentData {
  title: string
  content?: MinifiedEditorState | null
}

const { Form, Input, Field } = formFor<DocumentData>()

export function DocumentEditPage({ documentId }: { documentId: string }) {
  const result = useDocument({ id: documentId })
  if (!result.data?.document) return null
  const { document } = result.data

  return <DocumentEditorInner document={document} />
}

function DocumentEditorInner({ document }: { document: Document }) {
  const t = useT('components.documents.DocumentEditPage')
  const label = useT('domain.document')
  const [patchDocument] = usePatchDocument()
  const save = useCallback(
    (patch: unknown[]) => patchDocument({ id: document._id, document: patch }),
    [patchDocument, document._id],
  )
  const { formProps, state } = useAutosavingState<DocumentData, unknown[]>(document, save, patchStrategy.jsonPatch)
  const viewRoute = documentViewRoute(document)
  const params = getRouteApi(viewRoute).useParams()

  return <PageSection
    title={document.title}
    syncStatus={state}
    toolbar={
      <>
        <NavigateButton
          minimal
          to={viewRoute}
          params={params}
          icon={<EyeOpen />}
          text={t('viewDocument')}
        />
        <DeleteDocumentButton minimal document={document} />
      </>
    }
  >
    <Form {...formProps}>
      <Input path="title" label={label('title')} />
      <Field path="content" label={label('content')} component={Editor} />
    </Form>
  </PageSection>
}
