import React, {useRef}  from 'react';
import {ErrorMessage} from "./validation";
import {Classes, Icon, Intent, Button} from "@blueprintjs/core";
import {useClosableEditor} from "./hooks/useClosableEditor";
import {BasicInput} from "./BasicInput";
import {BasicTextArea} from "./BasicTextArea";
import {useOnClickOutside} from "./hooks/useOnClickOutside";

import "./ClickToEdit.sass";

export function ClickToEdit({
  value: originalValue,
  onChange: onChangeOriginal,
  onBlur,
  containerElement: Element = "span",
  className,
  valueFormatter,
  confirmOnEnter = true,
  editorComponent: Editor = TextEditor,
  editButton: EditButton = DefaultEditButton,
  ...validationSchema
}) {
  const {
    isOpen, onOpen,
    error, value, onChange,
    onCancel, onConfirm
  } = useClosableEditor(
    originalValue, onChangeOriginal, {validationSchema, onBlur}
  );
  const container = useRef();
  useOnClickOutside(container, isOpen ? onConfirm : null);

  if (!isOpen) {
    return <Element ref={container} onClick={onOpen}
      tabIndex={0} onFocus={onOpen}
      className={className ?? Classes.EDITABLE_TEXT+" click-to-edit"}
    >
      {valueFormatter ? valueFormatter(value) : value}
      {' '}
      {EditButton && <EditButton />}
    </Element>;
  }

  return <Element ref={container} className={className}
    onKeyDown={e => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter' && confirmOnEnter) onConfirm();
    }}
  >
    <Editor {...{value, onChange, onCancel, onConfirm}} />
    <ErrorMessage error={error} />
    <Button intent={Intent.SUCCESS} onClick={onConfirm} icon="tick" disabled={!!error} />
    <Button intent={Intent.DANGER} onClick={onCancel} icon="cross" />;
  </Element>;
}

function DefaultEditButton() {
  return <Icon intent={Intent.PRIMARY} icon="edit" />
}

function MultilineEditor({value, ...props}) {
  return <BasicTextArea value={value ?? ''} autoFocus growVertically {...props} />;
}
function TextEditor({value, ...props}) {
  return <BasicInput value={value ?? ''} autoFocus {...props} />;
}

ClickToEdit.MultilineEditor = MultilineEditor;
ClickToEdit.TextEditor = TextEditor;
