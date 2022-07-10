import React from 'react';
import {Intent, Card, FormGroup} from "@blueprintjs/core";
import {Button, useClosableEditor} from "libraries/forms";
import {ClickToEdit} from "libraries/forms";
import {MarkdownEditor} from 'components/MarkdownEditor';
import Markdown from 'markdown-to-jsx';

interface EditableMarkdownProps {
  label: string,
  labelStyle?: "inline" | "above"
  maxHeight?: number,
  plain?: boolean,
  overrides?: any,
  value: any,
  onChange: (val: any) => any,
  simple?: boolean,
}

export function EditableMarkdown({label, labelStyle, maxHeight = 200, plain, overrides, simple, ...props} : EditableMarkdownProps) {
  const {
    isOpen, onOpen,
    value, onChange,
    onCancel, onConfirm
  } = useClosableEditor(props.value, props.onChange);

  return <FormGroup label={label} inline={labelStyle === 'inline'}>
    {!isOpen ? 
      <div onClick={onOpen}>
        <MarkdownPreview value={value} maxHeight={maxHeight} plain={plain} overrides={overrides} />
        {plain || <Button text="Muokkaa tekstiä" onClick={onOpen} />}
      </div>
      : <>
        {simple 
          ? <div className="markdown-editor bp3-input"><ClickToEdit.MultilineEditor value={value} onChange={onChange} /></div>
          : <MarkdownEditor value={value} onChange={onChange} />
        }
        <div style={{textAlign: 'right', padding: "20px 20px 0 0"}}>
          <Button intent={Intent.PRIMARY} text="Tallenna" onClick={onConfirm} />
          <Button text="Peruuta" onClick={onCancel} />
        </div>
      </>
      
    }
  </FormGroup>;
}

export function MarkdownPreview({value, overrides, maxHeight, plain}) {
  const content = value ? <Markdown options={{overrides}}>{value}</Markdown>
    : <span style={{color: '#666', marginRight: 10}}>&lt;Ei ohjetta&gt;</span>;
  if (plain) return content;
  return <Card style={{overflow: 'auto', maxHeight}}>{content}</Card>
}
