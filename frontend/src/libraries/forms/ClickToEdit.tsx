import React, {useRef}  from 'react';
import {ErrorMessage} from "./validation";
import {Classes, Icon, Intent, Button} from "@blueprintjs/core";
import {useClosableEditor} from "./hooks/useClosableEditor";
import {BasicInput} from "./BasicInput";
import {BasicTextArea} from "./BasicTextArea";
import {useOnClickOutside} from "./hooks/useOnClickOutside";

import "./ClickToEdit.sass";

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

interface ContainerElementProps<T> extends React.ClassAttributes<T> {
  onClick: (e: any) => any,
  onFocus: (e: any) => any,
}

interface TextEditorProps {
  value: any,
  onChange: (value: string, event: React.ChangeEvent) => any
  [x: string] : any
}

export function ClickToEdit({
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
    originalValue, onChangeOriginal, {validationSchema, onBlur}
  );
  const container = useRef(null);
  useOnClickOutside(container, isOpen ? onConfirm : null);

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

  return <span ref={container} className={className}
    onKeyDown={e => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter' && confirmOnEnter) onConfirm();
    }}
  >
    <Editor {...{value, onChange, onCancel, onConfirm}} />
    <ErrorMessage error={error} />
    <Button intent={Intent.SUCCESS} onClick={onConfirm} icon="tick" disabled={!!error} />
    <Button intent={Intent.DANGER} onClick={onCancel} icon="cross" />;
  </span>;
}

function DefaultEditButton() {
  return <Icon intent={Intent.PRIMARY} icon="edit" />
}

function MultilineEditor({value, ...props} : TextEditorProps) {
  return <BasicTextArea value={value ?? ''} autoFocus growVertically {...props} />;
}
function TextEditor({value, ...props} : TextEditorProps) {
  return <BasicInput value={value ?? ''} autoFocus {...props} />;
}

ClickToEdit.MultilineEditor = MultilineEditor;
ClickToEdit.TextEditor = TextEditor;
