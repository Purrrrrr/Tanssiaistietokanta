import React, {useState} from 'react';
import {H2, Alert, Button, HTMLTable, Intent} from "@blueprintjs/core";
import {PropertyEditor, required} from "./widgets/PropertyEditor";
import {DanceLengthProperty} from "./widgets/DurationField";

export function DanceEditor({dance, onChange, onDelete}) {
  return <>
    <H2>
      <PropertyEditor property="name" data={dance} onChange={onChange} validate={required('Tanssilla pitää olla nimi')}/>
      {onDelete && <DeleteButton onDelete={() => onDelete(dance)}/>}
    </H2>
    <HTMLTable condensed>
      <tbody>
        <tr>
          <DancePropertyCells label="Lyhyt kuvaus" property="description" data={dance} onChange={onChange} />
          <DancePropertyCells label="Tanssikuvio" property="formation" data={dance} onChange={onChange} />
        </tr>
        <tr>
          <DancePropertyCells label="Alkusoitto" property="prelude" data={dance} onChange={onChange} />
          <DancePropertyCells label="Huomautuksia" property="remarks" data={dance} onChange={onChange} />
        </tr>
        <tr>
          <DancePropertyCells label="Kesto" property="duration" data={dance} onChange={onChange} component={DanceLengthProperty} />
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

function DancePropertyCells({label, component = PropertyEditor, ...props}) {
  const Component = component;
  return <>
    <th>{label}</th>
    <td>
      <Component {...props} />
    </td>
  </>;
}
