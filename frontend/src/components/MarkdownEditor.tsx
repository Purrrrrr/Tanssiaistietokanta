import React from 'react';
import {FormGroup} from "libraries/ui";
import MdEditor, { Plugins }  from 'react-markdown-editor-lite';
import Markdown from 'markdown-to-jsx';

import 'react-markdown-editor-lite/lib/index.css';
import './MarkdownEditor.sass'

MdEditor.unuse(Plugins.Image)

interface MarkdownEditorProps {
  label?: string
  labelStyle?: 'inline'
  value: any
  onChange: (v: string) => any
}

export function MarkdownEditor({label, labelStyle, ...props} : MarkdownEditorProps) {
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
