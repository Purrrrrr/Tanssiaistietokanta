import React, {useRef}  from 'react';
import {ErrorMessage} from "./validation";
import {Classes, Icon, Intent, Button} from "@blueprintjs/core";
import {useClosableEditor} from "./hooks/useClosableEditor";
import {BasicInput} from "./BasicInput";
import {BasicTextArea} from "./BasicTextArea";
import {useOnClickOutside} from "./hooks/useOnClickOutside";

import "./ClickToEdit.sass";

export function ClickToEdit({
  element: Element = "span",
  value: originalValue,
  valueFormatter,
  onChange: onChangeOriginal,
  confirmOnEnter = true,
  onBlur,
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
    originalValue, onChangeOriginal, {validationSchema, onBlur}
  );
  const container = useRef();
  useOnClickOutside(container, isOpen ? onConfirm : null);

  if (!isOpen) {
    return <Element ref={container} onClick={onOpen}
      tabIndex={0} onFocus={onOpen}
      className={className ?? Classes.EDITABLE_TEXT+" click-to-edit"}>
      {valueFormatter ? valueFormatter(value) : value}
      {' '}
      {noEditIcon || <Icon intent={Intent.PRIMARY} icon="edit" />}
    </Element>;
  }

  return <Element ref={container} className={className}
    onKeyDown={e => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter' && confirmOnEnter) onConfirm();
    }}>
    {getField(
      {component, children, componentProps, growVertically},
      {value, onChange, onCancel, onConfirm}
    )}
    <ErrorMessage error={error} />
    <Button intent={Intent.SUCCESS} onClick={onConfirm} icon="tick" />
    <Button intent={Intent.DANGER} onClick={onCancel} icon="cross" />
  </Element>;
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
