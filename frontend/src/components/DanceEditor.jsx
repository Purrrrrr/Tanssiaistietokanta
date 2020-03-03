import React from 'react';
import {H2, HTMLTable} from "@blueprintjs/core";
import {DurationField} from "./widgets/DurationField";
import {DeleteButton} from "./widgets/DeleteButton";
import {EditableText} from "libraries/forms";
import {useOnChangeForPropInValue} from 'utils/useOnChangeForProp';

export function DanceEditor({dance, onChange, onDelete}) {
  const onChangeFor = useOnChangeForPropInValue(onChange, dance);
  const {name, description, formation, prelude, remarks, duration} = dance;
  return <>
    <H2>
      <EditableText value={name} onChange={onChangeFor('name')} required />
      {onDelete &&
          <DeleteButton onDelete={() => onDelete(dance)}
            style={{float: "right"}}
            text="Poista tanssi"
            confirmText="Haluatko varmasti poistaa tämän tanssin?"
          />
      }
    </H2>
    <HTMLTable condensed>
      <tbody>
        <tr>
          <DancePropertyCells label="Lyhyt kuvaus" value={description} onChange={onChangeFor('description')} />
          <DancePropertyCells label="Tanssikuvio" value={formation} onChange={onChangeFor('formation')} />
        </tr>
        <tr>
          <DancePropertyCells label="Alkusoitto" value={prelude} onChange={onChangeFor('prelude')} />
          <DancePropertyCells label="Huomautuksia" value={remarks} onChange={onChangeFor('remarks')} />
        </tr>
        <tr>
          <DancePropertyCells label="Kesto" value={duration} onChange={onChangeFor('duration')} component={DurationField} />
        </tr>
      </tbody>
    </HTMLTable>
  </>;
}

function DancePropertyCells({label, component = EditableText, ...props}) {
  const Component = component;
  return <>
    <th>{label}</th>
    <td>
      <Component {...props} />
    </td>
  </>;
}
