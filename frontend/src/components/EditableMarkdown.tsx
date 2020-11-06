import React from 'react';
import {Intent, Dialog, Card, FormGroup} from "@blueprintjs/core";
import {Button, useClosableEditor} from "libraries/forms";
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
}

export function EditableMarkdown({label, labelStyle, maxHeight = 200, plain, overrides, ...props} : EditableMarkdownProps) {
  const {
    isOpen, onOpen,
    value, onChange,
    onCancel, onConfirm
  } = useClosableEditor(props.value, props.onChange);

  return <FormGroup label={label} inline={labelStyle === 'inline'}>
    <div onClick={onOpen}>
      <MarkdownPreview value={value} maxHeight={maxHeight} plain={plain} overrides={overrides} />
      {plain || <Button text="Muokkaa tekstiä" onClick={onOpen} />}
    </div>
    <Dialog isOpen={isOpen} lazy onClose={onCancel} title="Muokkaa ohjetta">
      <MarkdownEditor value={value} onChange={onChange} />
      <div style={{textAlign: 'right', padding: "20px 20px 0 0"}}>
        <Button intent={Intent.PRIMARY} text="Tallenna" onClick={onConfirm} />
        <Button text="Peruuta" onClick={onCancel} />
      </div>
    </Dialog>
  </FormGroup>;
}

function MarkdownPreview({value, overrides, maxHeight, plain}) {
  const content = value ? <Markdown options={{overrides}}>{value}</Markdown>
    : <span style={{color: 'gray', marginRight: 10}}>&lt;Ei ohjetta&gt;</span>;
  if (plain) return content;
  return <Card style={{overflow: 'auto', maxHeight}}>{content}</Card>
}
