import { lazy } from 'react'

export { type EditorProps } from './Editor'
export type { MinifiedEditorState } from './utils/minify'

export const DocumentViewer = lazy(() => import('./DocumentViewer').then(m => ({ default: m.DocumentViewer })))
export const Editor = lazy(() => import('./Editor').then(m => ({ default: m.Editor })))
