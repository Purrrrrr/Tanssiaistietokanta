import React, {useState, useEffect} from 'react';
import {EditableText, Icon, Intent} from "@blueprintjs/core";

export function PropertyEditor({property, data, onChange, defaultValue = "", validate = alwaysValid, component = EditableText}) {
  const Component = component;
  const value = data[property] || defaultValue;
  const [text, setText] = useState(value);
  const [editing, setEditing] = useState(false);
  useEffect(() => setText(value), [value]);

  const [isValid, error] = validate(text);

  function onConfirm() {
    if (!isValid) return;

    setEditing(false);
    if (text === data[property]) return;
      
    onChange({
      ...data,
      [property]: text
    });
  }
  function onCancel() {
    setEditing(false);
    setText(value);
  }

  return <>
    <Component value={text} onChange={setText} isEditing={editing}
      onEdit={() => setEditing(true)}
      placeholder="<Muokkaa tästä>"
      onConfirm={onConfirm} onCancel={onCancel}/>
    {editing && !isValid && <p><Icon intent={Intent.DANGER} icon="warning-sign"/>{error}</p>}
  </>;
}

function alwaysValid() {
  return [true, null];
}

export function required(message) {
  return value => {
    const isValid = value && ""+value.trim() !== "";
    return [isValid, isValid ? null : message];
  };
}
