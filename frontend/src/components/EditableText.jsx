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
    const Component = multiline ? TextArea : 'input';
    return <Component className="editableText" autoFocus growVertically value={value || ""}
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

