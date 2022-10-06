import React from 'react';
import {FormGroup} from "libraries/ui";
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from "rehype-sanitize";

import './MarkdownEditor.sass'

type MDEditorProps = {
  label?: string
  labelStyle?: 'inline'
  value: any,
  height?: number,
  onChange: (v: any) => any,
}

export function MarkdownEditor({label, labelStyle, ...props} : MDEditorProps) {
  return <FormGroup className="md-editor" label={label} inline={labelStyle === 'inline'}>
    <SimpleMarkdownEditor {...props} />
  </FormGroup>
}

export function SimpleMarkdownEditor({value, ...props}) {
  return <MDEditor
    commandsFilter={cmd =>
      //TODO: make the buttons accessible with the keyboard WITHOUT making navigation horrible
      ({...cmd, buttonProps: {...cmd.buttonProps, tabIndex: -1}})
    }
    defaultTabEnable={true}
    previewOptions={{
      rehypePlugins: [[rehypeSanitize]],
    }}
    value={value ?? ""}
    {...props}
  />
}
