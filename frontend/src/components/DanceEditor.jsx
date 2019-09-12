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
          <DancePropertyCells label="Pituus" property="length" dance={dance} onChange={onChange} type="number" />
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

function DancePropertyCells({label, ...props}) {
  return <>
    <th>{label}</th>
    <td>
      <DanceProperty {...props} />
    </td>
  </>;
}

export function DanceProperty({property, dance, onChange, type = "text"}) {
  const [text, setText] = useState(dance[property] || "");
  useEffect(() => setText(dance[property] || ""), [dance, property]);

  const onConfirm = (rawValue) => {
    const value = parseValue(type, rawValue);
    if (value === dance[property]) return;

    onChange({
      ...dance,
      [property]: value
    });
  };
  

  return <EditableText value={text} onChange={setText}
    placeholder="<Muokkaa tästä>"
    onConfirm={onConfirm} type={type} />;
}

function parseValue(type, value) {
  if (type === "number") return parseFloat(value);
  return value;
}
