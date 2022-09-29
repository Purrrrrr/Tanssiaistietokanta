import React from 'react';
import {FormGroup} from "libraries/ui";
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from "rehype-sanitize";

import './MarkdownEditor.sass'

type MDEditorProps = {
  label?: string
  labelStyle?: 'inline'
  value: any,
  onChange: (v: any) => any,
}

export function MarkdownEditor({label, labelStyle, ...props} : MDEditorProps) {
  return <FormGroup className="md-editor" label={label} inline={labelStyle === 'inline'}>
    <SimpleMarkdownEditor {...props} />
  </FormGroup>
}

export function SimpleMarkdownEditor(props) {
  return <MDEditor
    defaultTabEnable={true}
    previewOptions={{
      rehypePlugins: [[rehypeSanitize]],
    }}
    {...props}
  />
}
