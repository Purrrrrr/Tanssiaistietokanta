import 'react-markdown-editor-lite/lib/index.css'
import React from 'react'
import MdEditor from 'react-markdown-editor-lite'
import { MarkdownToJSX } from 'markdown-to-jsx'

import {Markdown} from 'libraries/ui'

import {FieldComponentProps} from '../types'

interface MarkdownEditorProps extends FieldComponentProps<string, HTMLTextAreaElement> {
  style?: React.CSSProperties
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void
  markdownOverrides?: MarkdownToJSX.Overrides
  noPreview?: boolean
}

export const MarkdownEditor = React.memo(function MarkdownEditor({value, onChange, inline: _ignored, markdownOverrides, noPreview, ...props} : MarkdownEditorProps) {
  return <MdEditor
    renderHTML={(text : string) => <Markdown options={{overrides: markdownOverrides}}>{text}</Markdown>}
    value={value ?? ''}
    onChange={({text}, e) => onChange(text, e)}
    {...props}
    view={noPreview ? {menu: true, md: true, html: false} : undefined}
    canView={noPreview ? {menu: true, md: true, html: false, both: false, fullScreen: true, hideMenu: true} : undefined}
  />
})
