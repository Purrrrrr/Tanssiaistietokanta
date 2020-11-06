import React from 'react';
import {H2, HTMLTable} from "@blueprintjs/core";
import {DurationField} from "./widgets/DurationField";
import {DeleteButton} from "./widgets/DeleteButton";
import {DanceDataImportButton} from "./DanceDataImportDialog";
import {EditableText} from "libraries/forms";
import {EditableMarkdown} from 'components/EditableMarkdown';
import {useOnChangeForPropInValue} from 'utils/useOnChangeForProp';
import {Dance} from "services/dances";

interface DanceEditorProps {
  dance: Dance,
  onChange: (changed: Dance) => any,
  onDelete?: any,
}

export function DanceEditor({dance, onChange, onDelete} : DanceEditorProps) {
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
        dance={dance}
        onImport={onChange}
        style={{float: "right"}} />
    </H2>
    <HTMLTable condensed>
      <tbody>
        <tr>
          <DancePropertyEditor label="Lyhyt kuvaus" multiline value={description} onChange={onChangeFor('description')} />
          <DancePropertyEditor label="Kategoria" value={category} onChange={onChangeFor('category')} />
        </tr>
        <tr>
          <DancePropertyEditor label="Alkusoitto" value={prelude} onChange={onChangeFor('prelude')} />
          <DancePropertyEditor label="Tanssikuvio" value={formation} onChange={onChangeFor('formation')} />
        </tr>
        <tr>
          <DanceDurationEditor label="Kesto" value={duration} onChange={onChangeFor('duration')} />
          <DancePropertyEditor label="Huomautuksia" value={remarks} onChange={onChangeFor('remarks')} />
        </tr>
      </tbody>
    </HTMLTable>
    <EditableMarkdown label="Tanssiohjeet" value={instructions} onChange={onChangeFor('instructions')} />
  </>;
}

const DancePropertyEditor = surroundWithLabelCells(EditableText);
const DanceDurationEditor = surroundWithLabelCells(DurationField);

function surroundWithLabelCells<P>(
  Component: React.ComponentType<P>
) {
  return ({label, colSpan = 1, ...props} : {label?: string, colSpan?: number}  & P ) =>
    <>
      <th>{label}</th>
      <td colSpan={colSpan*2-1}>
        <Component {...props as P} />
      </td>
    </>;
}
