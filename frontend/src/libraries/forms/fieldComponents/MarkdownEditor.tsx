import 'react-markdown-editor-lite/lib/index.css'
import React from 'react'
import { MarkdownToJSX } from 'markdown-to-jsx'

import {FieldComponentProps} from '../types'

import { MarkdownInput } from 'libraries/formsV2/components/inputs'

interface MarkdownEditorProps extends FieldComponentProps<string, HTMLTextAreaElement> {
  style?: React.CSSProperties
  className?: string
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void
  markdownOverrides?: MarkdownToJSX.Overrides
  noPreview?: boolean
}

export const MarkdownEditor = React.memo(function MarkdownEditor({value, onChange, className, inline: _ignored, markdownOverrides, noPreview, ...props} : MarkdownEditorProps) {
  return <MarkdownInput
    className={className}
    markdownOverrides={markdownOverrides}
    value={value}
    onChange={onChange}
    {...props}
    noPreview={noPreview}
  />
})
