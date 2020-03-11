import {FormGroup, Button, Intent} from "@blueprintjs/core";
import {DragHandle, ListEditor} from "components/ListEditor";
import React from 'react';
import * as L from 'partial.lenses';
import {gql, useQuery} from "services/Apollo";

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
  abbreviationTaken: 'Lyhenne %(abbreviation)s on jo käytössä toisessa pajassa. Tässä tapahtumassa ovat jo käytössä seuraavat lyhenteet: %(abbreviations)s',
  description: 'Työpajan kuvaus',
  teachers: 'Opettaja(t)',
});

export function WorkshopEditor({eventId, workshop, onChange}) {
  const {abbreviation, name, description, teachers, dances} = workshop;
  const onChangeFor = useOnChangeForProp(onChange);

  return <>
    <FormGroup label={t`name`} labelInto={t`required`}>
      <Input value={name} onChange={onChangeFor('name')} required />
    </FormGroup>
    <FormGroup label={t`abbreviation`} helperText={t`abbreviationHelp`}>
      <AbbreviationField value={abbreviation ?? ''} onChange={onChangeFor('abbreviation')}
        workshopId={workshop._id} eventId={eventId}
      />
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

function AbbreviationField({value, onChange, workshopId, eventId}) {
  const usedWorkshopAbbreviations = useTakenWorkshopAbbreviations(eventId, workshopId);

  return <Input value={value} onChange={onChange}
    maxLength={3} validate={{notOneOf: usedWorkshopAbbreviations}}
    errorMessages={{notOneOf: getAbbreviationTakenError}}
  />
}

function getAbbreviationTakenError({value, values}) {
  return t(
    'abbreviationTaken',
    {abbreviations: values, abbreviation: value}
  );
}

const GET_WORKSHOPS= gql`
query Workshops($eventId: ID!) {
  event(id: $eventId) {
    workshops {
      _id, abbreviation
    }
  }
}`;

function useTakenWorkshopAbbreviations(eventId, workshopId) {
  const {data} = useQuery(GET_WORKSHOPS, {variables: {eventId}});
  if (!data) return [];

  return data.event.workshops
    .filter(w => w._id !== workshopId)
    .map(w => w.abbreviation);
}

function DanceListItem({item, onChange, onRemove}) {
  return <>
    <DragHandle />
    <DanceChooser value={item} onChange={onChange} />
    <Button intent={Intent.DANGER} text="X" onClick={onRemove} />
  </>;
}
