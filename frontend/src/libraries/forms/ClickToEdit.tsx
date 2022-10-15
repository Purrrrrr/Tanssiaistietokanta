import React, {useRef}  from 'react';
import {ErrorMessage} from "./validation";
import {Classes} from "@blueprintjs/core";
import {Icon, Button} from "libraries/ui";
import {useClosableEditor} from "./hooks/useClosableEditor";
import {BasicInput} from "./Input";
import {BasicTextArea} from "./TextArea";

import "./ClickToEdit.sass";
import { asAccessibleField, FieldProps } from './FormField';

interface ClickToEditProps {
  value: any,
  onChange: (value: any) => any,
  onBlur?: (event: any) => any,
  className?: string,
  valueFormatter?: any,
  confirmOnEnter?: boolean,
  editorComponent?: React.ComponentType<TextEditorProps>,
  editButton?: React.ComponentType,
  [x: string] : any
}

interface TextEditorProps {
  value: any,
  onChange: (value: string, event: React.ChangeEvent) => any
  [x: string] : any
}

function LabellessClickToEdit({
  value: originalValue,
  onChange: onChangeOriginal,
  onBlur,
  className,
  valueFormatter,
  confirmOnEnter = true,
  editorComponent: Editor = TextEditor,
  editButton: EditButton = DefaultEditButton,
  ...validationSchema
} : ClickToEditProps) {
  const {
    isOpen, onOpen,
    error, value, onChange,
    onCancel, onConfirm
  } = useClosableEditor(
    originalValue, onChangeOriginal, {validationSchema}
  );
  const container = useRef<HTMLSpanElement>(null);

  if (!isOpen) {
    return <span ref={container} onClick={onOpen}
      tabIndex={0} onFocus={onOpen}
      className={className ?? Classes.EDITABLE_TEXT+" click-to-edit"}
    >
      <>
        {valueFormatter ? valueFormatter(value) : value}
        {' '}
        {EditButton && <EditButton />}
      </>
    </span>;
  }

  function editorBlurred(e : React.FocusEvent) {
    const nextFocused = e.relatedTarget as Node;
    const containerElement = container.current;
    if (containerElement !== null && nextFocused && containerElement.contains(nextFocused)) {
      //Focus is still somewhere inside our editor
      return;
    }
    onConfirm(); //Lost focus, exit editor
    onBlur && onBlur(e);
  }

  return <span ref={container} className={className} onBlur={editorBlurred}
    onKeyDown={e => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter' && confirmOnEnter) onConfirm();
    }}
  >
    <Editor {...{value, onChange, onCancel, onConfirm}} />
    <ErrorMessage error={error} />
    <Button intent="success" onClick={onConfirm} icon="tick" disabled={!!error} />
    <Button intent="danger" onClick={onCancel} icon="cross" />
  </span>;
}

function DefaultEditButton() {
  return <Icon className="click-to-edit-button" intent="primary" icon="edit" />
}

function MultilineEditor({value, onConfirm, onCancel, ...props} : TextEditorProps) {
  return <BasicTextArea value={value ?? ''} autoFocus growVertically {...props} />;
}
function TextEditor({value, onConfirm, onCancel, ...props} : TextEditorProps) {
  return <BasicInput value={value ?? ''} autoFocus {...props} />;
}

export const ClickToEdit = asAccessibleField(LabellessClickToEdit) as React.JSXElementConstructor<FieldProps<ClickToEditProps>> & { MultilineEditor: typeof MultilineEditor, TextEditor : typeof TextEditor, DefaultEditButton : typeof DefaultEditButton};
ClickToEdit.DefaultEditButton = DefaultEditButton;
ClickToEdit.MultilineEditor = MultilineEditor;
ClickToEdit.TextEditor = TextEditor;


