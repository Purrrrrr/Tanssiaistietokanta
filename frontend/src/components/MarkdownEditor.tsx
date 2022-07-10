import React from 'react';
import Markdown from 'markdown-to-jsx';
import {Intent} from "@blueprintjs/core";
import {Button, ClickToEdit, useClosableEditor} from 'libraries/forms'
import {ListEditor, DragHandle} from 'components/ListEditor'

import './MarkdownEditor.sass'

export function MarkdownEditor({value, onChange}) {
  const parts = toParts(value ?? "")
  function setParts(parts) {
    onChange(parts.join("\n\n"));
  }
  const addPart = () => setParts([...parts, "#Otsikko\nsisältö"])

  return <div className="markdown-editor bp3-input">
    <ListEditor items={parts} onChange={setParts}  helperClass="markdown-editor-helper"
    noWrapper useDragHandle component={PartEditor} />

    <Button icon="add" intent={Intent.PRIMARY} minimal onClick={addPart} >Lisää uusi osio</Button>
  </div>;
}

function toParts(markdown) {
  const parts = markdown.split(headerRegex).filter(text => text.trim().length > 0);
  return parts.length > 0 ? parts : [];
}
const headerRegex = /\n((?=#+.+\n)|(?=.+\n=+\n)|(?=.+\n-+\n))/gm;

function PartEditor({onRemove, item, items, onChange: setItem}) {
  const {
    isOpen, onOpen,
    value, onChange,
    onCancel, onConfirm
  } = useClosableEditor(item, setItem);

  return <div className="markdown-part">
    <div className="buttons">
      {isOpen
          ? <>
            <Button intent={Intent.SUCCESS} onClick={onConfirm} icon="tick" >Tallenna</Button>
            <Button intent={Intent.DANGER} onClick={onCancel} icon="cross" >Peruuta</Button>
          </>
          : <>
          <DragHandle />
          <Button icon="edit" intent={Intent.PRIMARY} minimal onClick={onOpen} >Muokkaa osiota</Button>
          <Button icon="cross" intent={Intent.DANGER} minimal onClick={onRemove} >Poista osio</Button>
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

export function SimpleMarkdownEditor(props) {
  const {
    isOpen, onOpen,
    value, onChange,
    onCancel, onConfirm
  } = useClosableEditor(props.value, props.onChange);

  return <div className="markdown-part">
    <div className="buttons">
      {isOpen
          && <>
            <Button intent={Intent.SUCCESS} onClick={onConfirm} icon="tick" >Tallenna</Button>
            <Button intent={Intent.DANGER} onClick={onCancel} icon="cross" >Peruuta</Button>
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
  return <div className="placeholder">&lt;Tyhjä osio&gt;</div>;
}
