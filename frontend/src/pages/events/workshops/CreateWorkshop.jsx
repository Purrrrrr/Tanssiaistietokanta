import {Button, Intent} from "@blueprintjs/core";
import {CREATE_WORKSHOP, toWorkshopInput} from 'services/workshops';
import {DragHandle, ListEditor} from "components/ListEditor";
import React, {useState} from 'react';

import {AdminOnly} from 'services/users';
import {Breadcrumb} from "components/Breadcrumbs";
import {DanceChooser} from "components/widgets/DanceChooser";
import {MutateButton} from "components/widgets/MutateButton";
import {makeTranslate} from 'utils/translate';
import {useOnChangeForProp} from 'utils/useOnChangeForProp';
import {Validate, useValidationResult} from "libraries/form-validation";
import {BasicInput} from "libraries/form-inputs";

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
  const setDances = dances => setWorkshop({...workshop, dances});
  const onChangeFor = useOnChangeForProp(setWorkshop);
  const {name, dances} = workshop;
  const {hasErrors, ValidationContainer} = useValidationResult();

  return <AdminOnly>
    <Breadcrumb text={t`newWorkshop`} href={uri} />
    <t.h1>newWorkshop</t.h1>
    <ValidationContainer>
      {t`name`+" "}
      <BasicInput value={name} onChange={onChangeFor('name')} />
      <Validate value={name} required />
      <t.h2>dances</t.h2>
      <ListEditor items={dances} onChange={onChangeFor('dances')}
        component={DanceListItem} />
      <Validate value={dances} type="array" required />
      <div>
        {t`addDance`+' '}
        <DanceChooser value={null} onChange={dance => setDances([...workshop.dances, dance])} key={workshop.dances.length} />
      </div>
    </ValidationContainer>
    <MutateButton disabled={hasErrors} mutation={CREATE_WORKSHOP} successUrl="../.."
      variables={{eventId: event._id, workshop: toWorkshopInput(workshop)}}
      refetchQueries={['getEvent']}
      text={t`create`} />
  </AdminOnly>;
}

function DanceListItem({item, onChange, onRemove}) {
  return <>
    <DragHandle />
    <DanceChooser value={item} onChange={onChange} />
    <Button intent={Intent.DANGER} text="X" onClick={onRemove} />
  </>;
}
