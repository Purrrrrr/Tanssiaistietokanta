import React from 'react';
import {H2, HTMLTable} from "@blueprintjs/core";
import {DurationField} from "./widgets/DurationField";
import {DeleteButton} from "./widgets/DeleteButton";
import {DanceDataImportButton} from "./DanceDataImportDialog";
import {EditableText} from "libraries/forms";
import {EditableMarkdown} from 'components/EditableMarkdown';
import {useOnChangeForPropInValue} from 'utils/useOnChangeForProp';

export function DanceEditor({dance, onChange, onDelete, asko}) {
  const onChangeFor = useOnChangeForPropInValue(onChange, dance);
  const {instructions, category, name, description, formation, prelude, remarks, duration} = dance;
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
      <DanceDataImportButton text="Hae tietoja tanssiwikistä"
        asko={asko}
        dance={dance}
        onImport={onChange}
        style={{float: "right"}} />
    </H2>
    <HTMLTable condensed>
      <tbody>
        <tr>
          <DancePropertyCells label="Lyhyt kuvaus" multiline value={description} onChange={onChangeFor('description')} />
          <DancePropertyCells label="Kategoria" value={category} onChange={onChangeFor('category')} />
        </tr>
        <tr>
          <DancePropertyCells label="Alkusoitto" value={prelude} onChange={onChangeFor('prelude')} />
          <DancePropertyCells label="Tanssikuvio" value={formation} onChange={onChangeFor('formation')} />
        </tr>
        <tr>
          <DancePropertyCells label="Kesto" value={duration} onChange={onChangeFor('duration')} component={DurationField} />
          <DancePropertyCells label="Huomautuksia" value={remarks} onChange={onChangeFor('remarks')} />
        </tr>
        <tr>
          <DancePropertyCells label="Tanssiohjeet" component={EditableMarkdown} colSpan={2} value={instructions} onChange={onChangeFor('instructions')} />
        </tr>
      </tbody>
    </HTMLTable>
  </>;
}

function DancePropertyCells({label, component = EditableText, colSpan = 1, ...props}) {
  const Component = component;
  return <>
    <th>{label}</th>
    <td colSpan={colSpan*2-1}>
      <Component {...props} />
    </td>
  </>;
}
