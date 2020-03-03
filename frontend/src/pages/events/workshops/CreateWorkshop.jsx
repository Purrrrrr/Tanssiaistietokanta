import {Button, Intent} from "@blueprintjs/core";
import {useCreateWorkshop} from 'services/workshops';
import {DragHandle, ListEditor} from "components/ListEditor";
import React, {useState} from 'react';
import * as L from 'partial.lenses';

import {AdminOnly} from 'services/users';
import {Breadcrumb} from "components/Breadcrumbs";
import {DanceChooser} from "components/widgets/DanceChooser";
import {makeTranslate} from 'utils/translate';
import {useOnChangeForProp} from 'utils/useOnChangeForProp';
import {navigate} from "@reach/router"
import {Input, Validate, Form, SubmitButton} from "libraries/forms";

const t = makeTranslate({
  create: 'Tallenna',
  dances: 'Tanssit',
  addDance: 'Lisää tanssi',
  name: 'Nimi',
  nameRequired: 'Täytä nimi',
  newWorkshop: 'Uusi työpaja',
});

export default function CreateWorkshopForm({event, uri}) {
  const [workshop, setWorkshop] = useState({
    name: '',
    dances: []
  });
  const [createWorkshop] = useCreateWorkshop({
    onCompleted: (data) => navigate('/events/'+event._id),
    refetchQueries: ['getEvent']
  });
  const {name, dances} = workshop;
  const onChangeFor = useOnChangeForProp(setWorkshop);

  return <AdminOnly>
    <Breadcrumb text={t`newWorkshop`} href={uri} />
    <t.h1>newWorkshop</t.h1>
    <Form onSubmit={() => createWorkshop(event._id, workshop)}>
      {t`name`+" "}
      <Input value={name} onChange={onChangeFor('name')} required />
      <t.h2>dances</t.h2>
      <ListEditor items={dances} onChange={onChangeFor('dances')}
        component={DanceListItem} />
      <Validate value={dances} type="array" required />
      <div>
        {t`addDance`+' '}
        <DanceChooser value={null} onChange={dance => onChangeFor('dances')(L.set(L.appendTo, dance))} key={workshop.dances.length} />
      </div>
      <SubmitButton text={t`create`} />
    </Form>
  </AdminOnly>;
}

function DanceListItem({item, onChange, onRemove}) {
  return <>
    <DragHandle />
    <DanceChooser value={item} onChange={onChange} />
    <Button intent={Intent.DANGER} text="X" onClick={onRemove} />
  </>;
}
