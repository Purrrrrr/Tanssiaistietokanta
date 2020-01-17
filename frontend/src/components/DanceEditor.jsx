import React from 'react';
import {H2, HTMLTable} from "@blueprintjs/core";
import {PropertyEditor, required} from "./widgets/PropertyEditor";
import {DurationField} from "./widgets/DurationField";
import {DeleteButton} from "./widgets/DeleteButton";

export function DanceEditor({dance, onChange, onDelete}) {
  return <>
    <H2>
      <PropertyEditor property="name" data={dance} onChange={onChange} validate={required('Tanssilla pitää olla nimi')}/>
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
          <DancePropertyCells label="Lyhyt kuvaus" property="description" data={dance} onChange={onChange} />
          <DancePropertyCells label="Tanssikuvio" property="formation" data={dance} onChange={onChange} />
        </tr>
        <tr>
          <DancePropertyCells label="Alkusoitto" property="prelude" data={dance} onChange={onChange} />
          <DancePropertyCells label="Huomautuksia" property="remarks" data={dance} onChange={onChange} />
        </tr>
        <tr>
          <DancePropertyCells label="Kesto" property="duration" data={dance} onChange={onChange} component={DurationField} />
        </tr>
      </tbody>
    </HTMLTable>
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
