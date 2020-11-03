import React from 'react';
import {Intent, Dialog, Card} from "@blueprintjs/core";
import {Button, useClosableEditor} from "libraries/forms";
import {MarkdownEditor} from 'components/MarkdownEditor';
import Markdown from 'markdown-to-jsx';

interface EditableMarkdownProps {
  maxHeight?: number,
  plain?: boolean,
  overrides?: any,
  value: any,
  onChange: (any) => any,
}

export function EditableMarkdown({maxHeight = 200, plain, overrides, ...props} : EditableMarkdownProps) {
  const {
    isOpen, onOpen,
    value, onChange,
    onCancel, onConfirm
  } = useClosableEditor(props.value, props.onChange);

  return <>
    <div onClick={onOpen}>
      {value
        ? (
          plain ?  <Markdown options={{overrides}}>{value}</Markdown>
          : <Card style={{overflow: 'auto', maxHeight}}>
            <Markdown options={{overrides}}>{value}</Markdown>
          </Card>
        )
        : <span style={{color: 'gray', marginRight: 10}}>&lt;Ei ohjetta&gt;</span>
      }
      {plain || <Button text="Muokkaa" onClick={onOpen} />}
    </div>
    <Dialog isOpen={isOpen} lazy onClose={onCancel} title="Muokkaa ohjetta">
      <MarkdownEditor value={value} onChange={onChange} />
      <div style={{textAlign: 'right', padding: "20px 20px 0 0"}}>
        <Button intent={Intent.PRIMARY} text="Tallenna" onClick={onConfirm} />
        <Button text="Peruuta" onClick={onCancel} />
      </div>
    </Dialog>
  </>;
}
