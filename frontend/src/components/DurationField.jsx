import React, {useRef, useEffect} from 'react';
import {PropertyEditor} from "./PropertyEditor";
import {EditableText} from "@blueprintjs/core";

export function DanceLengthProperty(props) {
  return <>
    <PropertyEditor {...props} component={MinuteEditor} defaultValue={0}/>
    :
    <PropertyEditor {...props} component={SecondsEditor} defaultValue={0}/>
  </>;
}

function MinuteEditor({value, onChange, ...props}) {
  const seconds = value%60;
  const minutes = Math.floor(value/60);

  return <TimePartEditor {...props}
    value={minutes} onChange={(newValue) => onChange(toSeconds(parseFloat(newValue), seconds))} />
}

function SecondsEditor({value, onChange, ...props}) {
  const seconds = value%60;
  const minutes = Math.floor(value/60);

  return <TimePartEditor {...props}
    value={seconds} onChange={(newValue) => onChange(toSeconds(minutes, parseFloat(newValue)))} />
}

function toSeconds(minutes, seconds) {
  return Math.max(seconds+(minutes*60), 0);
}

function TimePartEditor({isEditing, onEdit, value, ...props}) {
  const {onConfirm} = props;
  const span = useRef();
  useEffect(() => {
    if (isEditing) {
      //Hack around the limitations of EditableText ref support
      const input = span.current.querySelector("input");
      if (input != null) {
        input.addEventListener("blur", () => onConfirm());
      }
    }
  }, [isEditing, onConfirm]);

  return <span ref={span} onClick={onEdit}>
    {isEditing
      ? <EditableText {...props} value={value}
        minWidth={40} type="number" isEditing />
      : (value < 10 ? "0" : "") + value.toFixed()}
  </span>;
}
