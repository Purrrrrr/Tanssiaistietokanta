import { Workshop } from './types'

import { MinifiedDocumentContent } from 'libraries/lexical'
import { DocumentViewer } from 'libraries/lexical/DocumentViewer'
import { useTranslation } from 'i18n'

export function TeachedIn({ teachedIn }: { teachedIn: Workshop[] }) {
  const teachedInStr = teachedIn.map(
    ({ workshop, instances }) => instances
      ? `${workshop.name} (${instances.map(i => i.abbreviation).join('/')})`
      : workshop.name,
  ).join(', ')

  return `${useTranslation('components.slide.teachedInSet')} ${teachedInStr}`
}

export function renderDoc(doc?: MinifiedDocumentContent | null) {
  return <DocumentViewer document={doc} />
}
