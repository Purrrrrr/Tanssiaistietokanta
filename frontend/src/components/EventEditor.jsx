import React, {useState} from 'react';
import produce from 'immer'
import {Button, Intent} from "@blueprintjs/core";

import {PropertyEditor, required} from "./widgets/PropertyEditor";
import {ListEditor} from "./ListEditor";
import {ProgramTopicChooser} from "./widgets/ProgramTopicChooser";
import {makeTranslate} from 'utils/translate';

const t = makeTranslate({
  name: 'Nimi',
  basicDetails: 'Perustiedot',
  danceProgram: 'Tanssiaisohjelma',
  nameRequired: 'Täytä nimi',
  addEntry: 'Lisää',
  addEntryTitle: 'Lisää ohjelmaa',
  programListIsEmpty: 'Tanssiaisohjelma on tyhjä. Lisää ohjelmaan kohtia alta',
});

export function EventEditor({event, onChange}) {
  return <div>
    <h2>{t('basicDetails')}</h2>
    {t('name')+" "}
    <PropertyEditor property="name" data={event} onChange={onChange} validate={required(t('nameRequired'))}/>
    <ProgramEditor program={event.program || []} onChange={program => onChange({...event, program})} />
  </div>;
}

function ProgramEditor({program, onChange}) {
  function addItem(item) {
    if (!item.name) return;
    onChange(produce(program, draft => {
      draft.push(item);
    }));
    setNewItem(null);
  }
  const [newItem, setNewItem] = useState();


  return <>
    <h2>{t('danceProgram')}</h2>
    <ListEditor items={program} onChange={onChange} 
      component={ProgramItemEditor} />
    {program.length ? null : <p className="bp3-text-muted">{t('programListIsEmpty')}</p>}
    <h3>{t('addEntryTitle')}</h3>
    <ProgramItemEditor key={program.length} item={newItem} onChange={setNewItem} onAdd={addItem}/>
  </>
}

function ProgramItemEditor({item, onChange, onRemove, onAdd}) {
  return <>
    <ProgramTopicChooser value={item} onChange={onChange} />
    {onRemove && <Button intent={Intent.DANGER} text="X" onClick={onRemove} />}
    {onAdd && <Button text={t('addEntry')} onClick={() => onAdd(item)} />}
  </>
}
