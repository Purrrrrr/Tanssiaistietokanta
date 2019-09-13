import React, {useState, useEffect} from 'react';
import {H2, Alert, Button, EditableText, HTMLTable, Intent} from "@blueprintjs/core";

export function DanceEditor({dance, onChange, onDelete}) {
  return <>
    <H2>
      <DanceProperty property="name" dance={dance} onChange={onChange} />
      {onDelete && <DeleteButton onDelete={() => onDelete(dance)}/>}
    </H2>
    <HTMLTable condensed>
      <tbody>
        <tr>
          <DancePropertyCells label="Lyhyt kuvaus" property="description" dance={dance} onChange={onChange} />
          <DancePropertyCells label="Tanssikuvio" property="formation" dance={dance} onChange={onChange} />
        </tr>
        <tr>
          <DancePropertyCells label="Alkusoitto" property="prelude" dance={dance} onChange={onChange} />
          <DancePropertyCells label="Huomautuksia" property="remarks" dance={dance} onChange={onChange} />
        </tr>
        <tr>
          <DancePropertyCells label="Pituus" property="length" dance={dance} onChange={onChange} component={DanceLengthProperty} />
        </tr>
      </tbody>
    </HTMLTable>
  </>;
}

function DeleteButton({onDelete}) {
  const [showDialog, setShowDialog] = useState(false);
  return <>
    <Button style={{float: "right"}} icon="trash" text="Poista tanssi" intent={Intent.DANGER} onClick={() => setShowDialog(true)}/>
    <Alert isOpen={showDialog} onClose={() => setShowDialog(false)}
      onConfirm={onDelete}
      intent={Intent.DANGER}
      cancelButtonText="Peruuta"
      confirmButtonText="Poista">
      Haluatko varmasti poistaa tämän tanssin?
    </Alert>
  </>;
}

function DancePropertyCells({label, component = DanceProperty, ...props}) {
  const Component = component;
  return <>
    <th>{label}</th>
    <td>
      <Component {...props} />
    </td>
  </>;
}

export function DanceProperty({property, dance, onChange}) {
  const [text, setText] = useState(dance[property] || "");
  useEffect(() => setText(dance[property] || ""), [dance, property]);

  const onConfirm = (value) => {
    if (value === dance[property]) return;

    onChange({
      ...dance,
      [property]: value
    });
  };

  return <EditableText value={text} onChange={setText}
    placeholder="<Muokkaa tästä>"
    onConfirm={onConfirm} />;
}

function DanceLengthProperty({property, dance, onChange}) {
  const length = dance[property] || 0;
  const seconds = length%60;
  const minutes = Math.floor(length/60);

  function setLength(minutes, seconds) {
    const newLength = seconds+(minutes*60);
    if (newLength === dance[property]) return;

    onChange({
      ...dance,
      [property]: newLength
    });
  }

  return <>
    <EditableTimePart value={minutes}
      onChange={(newVal) => setLength(newVal, seconds)} />
    :
    <EditableTimePart value={seconds}
      onChange={(newVal) => setLength(minutes, newVal)} />
  </>
}

function EditableTimePart({value, onChange}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState();

  function onConfirm(newValue) {
    const parsed = parseFloat(newValue);
    setEditing(false);
    //Fall back to old value if the new one is garbage!
    onChange(isNaN(parsed) ? value : parsed);
  }

  if (editing) {
    return <EditableText value={text} onChange={setText} minWidth={40}
      isEditing onCancel={() => setEditing(false)}
      onConfirm={onConfirm} type="number"/>
  } else {
    return <span onClick={() => {setEditing(true); setText(value.toFixed());}}>
      {(value < 10 ? "0" : "") + value.toFixed()}
    </span>;
  }

}

