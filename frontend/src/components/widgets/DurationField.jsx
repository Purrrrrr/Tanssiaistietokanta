import React, {useRef, useEffect} from 'react';
import {PropertyEditor} from "./PropertyEditor";
import {EditableText} from "@blueprintjs/core";
import {toMinSec, toSeconds, prefixZero} from "utils/duration";

export function DurationField(props) {
  return <>
    <PropertyEditor {...props} component={MinuteEditor} defaultValue={0}/>
    :
    <PropertyEditor {...props} component={SecondsEditor} defaultValue={0}/>
  </>;
}

function MinuteEditor({value, onChange, ...props}) {
  const [minutes, seconds] = toMinSec(value);

  return <TimePartEditor {...props}
    value={minutes} onChange={(newValue) => onChange(toSeconds(parseFloat(newValue || "0"), seconds))} />
}

function SecondsEditor({value, onChange, ...props}) {
  const seconds = value%60;
  const minutes = Math.floor(value/60);

  return <TimePartEditor {...props}
    value={seconds} onChange={(newValue) => onChange(toSeconds(minutes, parseFloat(newValue || "0")))} />
}

function TimePartEditor({isEditing, onEdit, value, onConfirm, ...props}) {
  const span = useRef();
  const onConfirmRef = useRef();
  onConfirmRef.current = onConfirm;

  useEffect(() => {
    if (isEditing) {
      //Hack around the limitations of EditableText ref support
      const input = span.current.querySelector("input");
      if (input != null) {
        //Both confirm and just blurring should trigger this
        input.addEventListener("blur", () => onConfirmRef.current());
      }
    }
  }, [isEditing, onConfirmRef]);

  return <span ref={span} onClick={onEdit} className="bp3-editable-text" tabIndex="0" onFocus={onEdit}>
    {isEditing
      ? <EditableText {...props} value={value}
        minWidth={40} type="number" isEditing />
      : prefixZero(value)}
  </span>;
}
