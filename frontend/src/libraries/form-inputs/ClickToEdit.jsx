import React, {useRef}  from 'react';
import {ErrorMessage} from "libraries/form-validation";
import {Classes, Icon, Intent, Button} from "@blueprintjs/core";
import {useClosableEditor} from "./useClosableEditor";
import {BasicInput} from "./BasicInput";
import {BasicTextArea} from "./BasicTextArea";
import {useOnClickOutside} from "./useOnClickOutside";

import "./ClickToEdit.sass";

export function ClickToEdit({
  value: originalValue, 
  valueFormatter,
  onChange: onChangeOriginal, 
  children, component, componentProps, growVertically,
  className, 
  noEditIcon,
  ...validationSchema
}) {
  const {
    isOpen, onOpen, 
    error, value, onChange,
    onCancel, onConfirm
  } = useClosableEditor(
    originalValue, onChangeOriginal, validationSchema
  );
  const container = useRef();
  useOnClickOutside(container, isOpen ? onConfirm : null);

  if (!isOpen) {
    return <span ref={container} onClick={onOpen}
      className={className ?? Classes.EDITABLE_TEXT+" click-to-edit"}>
      {valueFormatter ? valueFormatter(value) : value}
      {' '}
      {noEditIcon || <Icon intent={Intent.PRIMARY} icon="edit" />}
    </span>;
  }

  return <span ref={container} className={className}
    onKeyDown={e => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    }}>
    {getField(
      {component, children, componentProps, growVertically},
      {value, onChange, onCancel, onConfirm}
    )}
    {error && <ErrorMessage message={error.errors.join(', ')}/>}
    <Button intent={Intent.SUCCESS} onClick={onConfirm} icon="tick" />
    <Button intent={Intent.DANGER} onClick={onCancel} icon="cross" />
  </span>;
}

function getField({component, children, growVertically, componentProps = {}}, props) {
  if (component) {
    const C = component; 
    return <C {...props} {...componentProps} />;
  } else if (children) {
    return children(props);
  } else if (growVertically) {
    return <BasicTextArea value={props.value} onChange={props.onChange} autoFocus growVertically />;
  }
  return <BasicInput value={props.value} onChange={props.onChange} autoFocus />;
}
