import React from 'react'
import MdEditor, { Plugins }  from 'react-markdown-editor-lite'
import Markdown from 'markdown-to-jsx'
import {FieldComponentProps} from 'libraries/forms2'

import 'react-markdown-editor-lite/lib/index.css'

MdEditor.unuse(Plugins.Image)

interface MarkdownEditorProps extends FieldComponentProps<string, HTMLTextAreaElement> {
  style?: React.CSSProperties
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void
  markdownOverrides?: Record<string, unknown>
}

export const MarkdownEditor = React.memo(function MarkdownEditor({value, onChange, hasConflict, markdownOverrides, ...props} : MarkdownEditorProps) {
  return <MdEditor
    renderHTML={(text : string) => <Markdown options={{overrides: markdownOverrides}}>{text}</Markdown>}
    value={value ?? ''}
    onChange={({text}, e) => onChange(text, e!)}
    {...props}
  />
})
