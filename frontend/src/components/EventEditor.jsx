import React, {useState} from 'react';
import produce from 'immer'
import {Button, Intent} from "@blueprintjs/core";

import {PropertyEditor, required} from "./PropertyEditor";
import {ListEditor} from "./ListEditor";
import {ProgramTopicChooser} from "./ProgramTopicChooser";
import {guid} from "../utils/guid";

export function EventEditor({event, onChange}) {
  return <div>
    Nimi{" "}
    <PropertyEditor property="name" data={event} onChange={onChange} validate={required('Täytä nimi')}/>
    <p>Ohjelma</p>
    <ProgramEditor program={event.program || []} onChange={program => onChange({...event, program})} />
  </div>;
}

function ProgramEditor({program, onChange}) {
  function addItem(item) {
    if (!item.name) return;
    onChange(produce(program, draft => { 
      draft.push({...item, id: guid()}); 
    }));
    setNewItem(null);
  }
  const [newItem, setNewItem] = useState();


  return <>
    <ListEditor items={program} onChange={onChange}>
      {ProgramItemEditor}
    </ListEditor>
    <ProgramItemEditor key={program.length} item={newItem} onChange={setNewItem} onAdd={addItem}/>
  </>
}

function ProgramItemEditor({item, onChange, onRemove, onAdd}) {
  return <>
    <ProgramTopicChooser value={item} onChange={onChange} />
    {onRemove && <Button intent={Intent.DANGER} text="X" onClick={onRemove} />}
    {onAdd && <Button text="Lisää" onClick={() => onAdd(item)} />}
  </>
}
