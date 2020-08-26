import React from 'react';
import Markdown from 'markdown-to-jsx';
import {Button, Intent} from "@blueprintjs/core";
import {ClickToEdit, useClosableEditor} from 'libraries/forms'
import {ListEditor, DragHandle} from 'components/ListEditor'

import './MarkdownEditor.sass'

export function MarkdownEditor({value, onChange}) {
  const parts = toParts(value ?? "")
  function setParts(parts) {
    onChange(parts.join("\n\n"));
  }

  return <ListEditor items={parts} onChange={setParts}  helperClass="markdown-editor-helper"
    noWrapper useDragHandle className="markdown-editor bp3-input" component={PartEditor} />;
}

function toParts(markdown) {
  const parts = markdown.split(headerRegex).filter(text => text.trim().length > 0);
  return parts.length > 0 ? parts : [""];
}
const headerRegex = /\n((?=#+.+\n)|(?=.+\n=+\n)|(?=.+\n-+\n))/gm;

function PartEditor({onRemove, item, onChange: setItem}) {
  const {
    isOpen, onOpen,
    value, onChange,
    onCancel, onConfirm
  } = useClosableEditor(item, setItem);

  return <div className="markdown-part">
    <div className="buttons">
      {isOpen
          ? <>
            <Button intent={Intent.SUCCESS} onClick={onConfirm} icon="tick" />
            <Button intent={Intent.DANGER} onClick={onCancel} icon="cross" />
          </>
          : <>
          <DragHandle minimal />
          <Button icon="edit" intent={Intent.PRIMARY} minimal onClick={onOpen} />
          <Button icon="cross" intent={Intent.DANGER} minimal onClick={onRemove} />
          </>
      }
    </div>
    <div className="markdown-part-editor" onClick={isOpen ? undefined : onOpen}>
      {isOpen
        ? <ClickToEdit.MultilineEditor value={value} onChange={onChange} onBlur={onConfirm} />
        : value ? <Markdown>{value}</Markdown> : <Placeholder />
      }
    </div>
  </div>
}

function Placeholder() {
  return <div className="placeholder">&lt;Muokkaa tästä&gt;</div>;
}
