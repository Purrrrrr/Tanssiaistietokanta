import React from 'react';
import {toMinSec, toSeconds} from "utils/duration";
import {Duration} from "components/widgets/Duration";
import {ClickToEdit, Input} from 'libraries/forms'

export function DurationField(props) {
  return <ClickToEdit valueFormatter={val => <Duration value={val} />}
    {...props} editorComponent={DurationEditor} />
}

function DurationEditor({value, onChange}) {
  const [minutes, seconds] = toMinSec(value);

  return <>
    <Input label="DUMMY minuutit" type="number" style={{width: "4em"}} autoFocus
      value={minutes} onChange={(newValue) => onChange(toSeconds(parseFloat(newValue || "0"), seconds))} />
    :
    <Input label="DUMMY sekuntit" type="number" style={{width: "4em"}}
      value={Math.floor(seconds)} onChange={(newValue) => onChange(toSeconds(minutes, parseFloat(newValue || "0")))} />
  </>;
}
