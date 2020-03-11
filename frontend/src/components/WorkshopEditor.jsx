import {FormGroup, Button, Intent} from "@blueprintjs/core";
import {DragHandle, ListEditor} from "components/ListEditor";
import React from 'react';
import * as L from 'partial.lenses';

import {DanceChooser} from "components/widgets/DanceChooser";
import {makeTranslate} from 'utils/translate';
import {useOnChangeForProp} from 'utils/useOnChangeForProp';
import {Input, TextArea, Validate} from "libraries/forms";

const t = makeTranslate({
  dances: 'Tanssit',
  addDance: 'Lisää tanssi',
  name: 'Nimi',
  required: '(pakollinen)',
  abbreviation: 'Lyhennemerkintä',
  abbreviationHelp: 'Lyhennemerkintä näytetään settilistassa työpajassa opetettujen tanssien kohdalla',
  description: 'Työpajan kuvaus',
  teachers: 'Opettaja(t)',
});

export function WorkshopEditor({workshop, onChange}) {
  const {abbreviation, name, description, teachers, dances} = workshop;
  const onChangeFor = useOnChangeForProp(onChange);

  return <>
    <FormGroup label={t`name`} labelInto={t`required`}>
      <Input value={name} onChange={onChangeFor('name')} required />
    </FormGroup>
    <FormGroup label={t`abbreviation`} helperText={t`abbreviationHelp`}>
      <Input value={abbreviation ?? ''} onChange={onChangeFor('abbreviation')} maxLength={3} />
    </FormGroup>
    <FormGroup label={t`description`}>
      <TextArea value={description ?? ''} onChange={onChangeFor('description')} />
    </FormGroup>
    <FormGroup label={t`teachers`}>
      <Input value={teachers ?? ''} onChange={onChangeFor('teachers')} />
    </FormGroup>
    <t.h2>dances</t.h2>
    <ListEditor items={dances} onChange={onChangeFor('dances')}
      component={DanceListItem} />
    <Validate value={dances} type="array" required />
    <div>
      {t`addDance`+' '}
      <DanceChooser value={null} onChange={dance => onChangeFor('dances')(L.set(L.appendTo, dance))} key={dances.length} />
    </div>
    </>
}

function DanceListItem({item, onChange, onRemove}) {
  return <>
    <DragHandle />
    <DanceChooser value={item} onChange={onChange} />
    <Button intent={Intent.DANGER} text="X" onClick={onRemove} />
  </>;
}
