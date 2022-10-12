import React from 'react';
import {FormGroup} from "libraries/ui";
import MdEditor from 'react-markdown-editor-lite';
import Markdown from 'markdown-to-jsx';

import 'react-markdown-editor-lite/lib/index.css';
import './MarkdownEditor.sass'

type MDEditorProps = {
  label?: string
  labelStyle?: 'inline'
  value: any,
  height?: number,
  onChange: (v: string) => any,
}

export function MarkdownEditor({label, labelStyle, ...props} : MDEditorProps) {
  return <FormGroup className="md-editor" label={label} inline={labelStyle === 'inline'}>
    <SimpleMarkdownEditor {...props} />
  </FormGroup>
}

export function SimpleMarkdownEditor({value, onChange, ...props}) {
  return <MdEditor
    renderHTML={(text : string) => <Markdown>{text}</Markdown>}
    value={value ?? ""}
    onChange={({text}) => onChange(text)}
    {...props}
  />
}
