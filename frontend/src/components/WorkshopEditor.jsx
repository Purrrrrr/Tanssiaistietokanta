import {Button, Intent} from "@blueprintjs/core";
import {DragHandle, ListEditor} from "components/ListEditor";
import React from 'react';
import * as L from 'partial.lenses';

import {DanceChooser} from "components/widgets/DanceChooser";
import {makeTranslate} from 'utils/translate';
import {useOnChangeForProp} from 'utils/useOnChangeForProp';
import {Input, Validate} from "libraries/forms";

const t = makeTranslate({
  dances: 'Tanssit',
  addDance: 'Lisää tanssi',
  name: 'Nimi',
});

export function WorkshopEditor({workshop, onChange}) {
  const {name, dances} = workshop;
  const onChangeFor = useOnChangeForProp(onChange);

  return <>
    {t`name`+" "}
    <Input value={name} onChange={onChangeFor('name')} required />
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
