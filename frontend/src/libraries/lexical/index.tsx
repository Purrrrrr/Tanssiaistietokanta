import { lazy } from 'react'

import { FieldComponentProps } from 'libraries/forms'
import randomId from 'utils/randomId'

import { type EditorProps } from './Editor'
import type { MinifiedDocumentContent } from './utils/minify'

export type { MinifiedDocumentContent } from './utils/minify'

export const DocumentViewer = lazy(() => import('./DocumentViewer').then(m => ({ default: m.DocumentViewer })))
export const Editor = lazy(() => import('./Editor').then(m => ({ default: m.Editor })))

export interface DocumentContentEditorProps extends Omit<EditorProps, 'onChange'>, FieldComponentProps<MinifiedDocumentContent> {
  id: string
  value: MinifiedDocumentContent | null | undefined
}

export function DocumentContentEditor(props: DocumentContentEditorProps) {
  if (props.readOnly) {
    return <DocumentViewer document={props.value} className={props.className} />
  }
  return <Editor {...props} />
}

export function isEmptyDocument(root: MinifiedDocumentContent | null | undefined, treshold = 10): boolean {
  if (!root) return true
  const { c: children } = root
  if (!Array.isArray(children)) return true
  if (children.length === 0) return true
  if (children.length === 1) {
    const node = children[0]
    if (!Array.isArray(node.c)) return true

    const text = node.c.map(c => c.x).filter(x => typeof x === 'string').join('')
    return (text.trim().length < treshold)
  }
  return false
}

export const emptyDocument = () => ({
  V: 1, t: 'ro', c: [
    { _id: randomId(8), t: 'p', c: [] },
  ],
})
