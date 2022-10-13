import React from 'react';
import {Button, FormGroup} from "libraries/ui";
import {useClosableEditor} from "libraries/forms";
import {SimpleMarkdownEditor} from 'components/MarkdownEditor';
import Markdown from 'markdown-to-jsx';

interface EditableMarkdownProps {
  id: string,
  label: string,
  labelStyle?: "inline" | "above"
  maxHeight?: number,
  overrides?: any,
  value: any,
  onChange: (val: any) => any,
}

export function EditableMarkdown({id, label, labelStyle, maxHeight = 200, overrides, ...props} : EditableMarkdownProps) {
  const {
    isOpen, onOpen,
    value, onChange,
    onCancel, onConfirm
  } = useClosableEditor(props.value, props.onChange);

  return <FormGroup label={label} inline={labelStyle === 'inline'}>
    {!isOpen ? 
      <div onClick={onOpen}>
        <MarkdownPreview value={value} maxHeight={maxHeight} overrides={overrides} />
      </div>
      : <>
        <SimpleMarkdownEditor id={id} value={value} onChange={onChange} />
        <div style={{textAlign: 'right', padding: "20px 20px 0 0"}}>
          <Button intent="primary" text="Tallenna" onClick={onConfirm} />
          <Button text="Peruuta" onClick={onCancel} />
        </div>
      </>
      
    }
  </FormGroup>;
}

export function MarkdownPreview({value, overrides, maxHeight}) {
  return value ? <Markdown options={{overrides}}>{value}</Markdown>
    : <span style={{color: '#666', marginRight: 10}}>&lt;Ei ohjetta&gt;</span>;
}
