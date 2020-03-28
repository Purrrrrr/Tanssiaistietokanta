import React from 'react';
import {Button, Intent, Dialog, Card} from "@blueprintjs/core";
import {useClosableEditor} from "libraries/forms";
import {MarkdownEditor} from 'components/MarkdownEditor';
import Markdown from 'markdown-to-jsx';

export function EditableMarkdown({maxHeight = 200, plain, ...props}) {
  const {
    isOpen, onOpen,
    value, onChange,
    onCancel, onConfirm
  } = useClosableEditor(props.value, props.onChange);

  return <>
    <div onClick={onOpen}>
      {value
        ? (
          plain ?  <Markdown>{value}</Markdown>
          : <Card style={{overflow: 'auto', maxHeight}}>
            <Markdown>{value}</Markdown>
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
