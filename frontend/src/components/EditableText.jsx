import React, {useState} from 'react';
import {TextArea} from "@blueprintjs/core";

import './EditableText.sass';

export function EditableText({text, onChange, multiline, addText}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(text);

  if (editing) {
    const onBlur = () => {
      setEditing(false);
      onChange(value);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onBlur();
      } else if (e.key === 'Escape'){
        setValue(text);
        setEditing(false);
      }
    }
    const Component = multiline ? TextArea : 'input';
    const props = multiline ? {
      growVertically: true
    } : {}
    return <Component className="editableText" autoFocus
      value={value || ""} {...props}
      onKeyDown={onKeyDown}
      onChange={(e) => setValue(e.target.value)} onBlur={onBlur} />
  }

  const onClick = () => {
    setEditing(true);
    setValue(text);
  }
  return <span className="editableText" onClick={onClick}>
    {text || <span className="addEntry">{addText}</span>}
  </span>;

}

