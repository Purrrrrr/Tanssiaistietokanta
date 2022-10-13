import {DragHandle, ListEditor} from "components/ListEditor";
import React, {useState} from 'react';
import * as L from 'partial.lenses';
import {backendQueryHook} from "backend";
import {Workshop} from "types/Workshop";

import {Flex} from "components/Flex";
import {DanceChooser} from "components/widgets/DanceChooser";
import {makeTranslate} from 'utils/translate';
import {useOnChangeForProp} from 'utils/useOnChangeForProp';
import {Button, CssClass, FormGroup} from "libraries/ui";
import {Form, SubmitButton, fieldFor, Input, TextArea} from "libraries/forms2";

const t = makeTranslate({
  dances: 'Tanssit',
  addDance: 'Lisää tanssi: ',
  noDances: 'Työpajan tanssilista on tyhjä.',
  name: 'Nimi',
  required: '(pakollinen)',
  abbreviation: 'Lyhennemerkintä',
  abbreviationHelp: 'Lyhennemerkintä näytetään settilistassa työpajassa opetettujen tanssien kohdalla',
  abbreviationTaken: 'Lyhenne %(abbreviation)s on jo käytössä toisessa pajassa. Tässä tapahtumassa ovat jo käytössä seuraavat lyhenteet: %(abbreviations)s',
  description: 'Työpajan kuvaus',
  teachers: 'Opettaja(t)',
});

const Field = fieldFor<Workshop>()

export function WorkshopEditor({eventId, workshop, onSubmit, submitText}) {
  const [modifiedWorkshop, setWorkshop] = useState(workshop);
  const {dances} = modifiedWorkshop;
  const onChangeFor = useOnChangeForProp(setWorkshop);

  return <Form className={CssClass.limitedWidth} value={modifiedWorkshop} onChange={setWorkshop} onSubmit={onSubmit}>
    <Field path={["name"]} required component={Input} label={t`name`} labelInfo={t`required`} />
    <AbbreviationField path={["abbreviation"]} 
      label={t`abbreviation`}
      workshopId={workshop._id}
      eventId={eventId}
    />
    <Field path={['description']} component={TextArea} label={t`description`} />
    <Field path={["teachers"]} component={Input} label={t`teachers`}/>
    <t.h2>dances</t.h2>
    <ListEditor items={dances} onChange={onChangeFor('dances')}
      itemWrapper={Flex}
      component={DanceListItem} />
    {dances.length === 0 && <t.p className={CssClass.textMuted}>noDances</t.p>}
    <FormGroup label={t`addDance`} inlineFill style={{marginTop: 6}}>
      <DanceChooser excludeFromSearch={dances} value={null} onChange={dance => onChangeFor('dances')(L.set(L.appendTo, dance))} key={dances.length} />
    </FormGroup>
    <SubmitButton text={submitText} />
  </Form>
}

function AbbreviationField({workshopId, label, eventId, path}) {
  const usedWorkshopAbbreviations = useTakenWorkshopAbbreviations(eventId, workshopId);

  return <Field
    path={path}
    component={Input}
    label={label}
    helperText={t`abbreviationHelp`}
    maxLength={3}
    validate={{notOneOf: usedWorkshopAbbreviations, nullable: true}}
    errorMessages={{notOneOf: getAbbreviationTakenError}}
  />
}

function getAbbreviationTakenError({value, values}) {
  return t(
    'abbreviationTaken',
    {abbreviations: values, abbreviation: value}
  );
}

const useWorkshops = backendQueryHook(`
query Workshops($eventId: ID!) {
  event(id: $eventId) {
    workshops {
      _id, abbreviation
    }
  }
}`);

function useTakenWorkshopAbbreviations(eventId, workshopId) {
  const {data} = useWorkshops({eventId});
  if (!data) return [];

  return data.event.workshops
    .filter(w => w._id !== workshopId)
    .map(w => w.abbreviation);
}

function DanceListItem({items, item, onChange, onRemove}) {
  return <>
    <DanceChooser excludeFromSearch={items} value={item} onChange={onChange} />
    <DragHandle />
    <Button intent="danger" text="X" onClick={onRemove} />
  </>;
}
