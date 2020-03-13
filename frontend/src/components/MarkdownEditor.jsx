import React from 'react';
import Markdown from 'markdown-to-jsx';
import {Button, Intent} from "@blueprintjs/core";
import {ClickToEdit} from 'libraries/forms'
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

function PartEditor({onRemove, item, onChange}) {
  return <div className="markdown-part">
    <div className="buttons">
      <DragHandle minimal />
      <Button icon="edit" intent={Intent.PRIMARY} minimal
        onClick={e => window.t = e.target.closest('.markdown-part').children[1].click()} />
      <Button icon="cross" intent={Intent.DANGER} minimal
        onClick={onRemove} />
    </div>
    <ClickToEdit element="div" className="markdown-part-editor" 
      noEditIcon valueFormatter={val =>
          <Markdown>{val}</Markdown>
      }
      confirmOnEnter={false}
      growVertically value={item} onChange={onChange} />
  </div>
}
