import {Intent} from "@blueprintjs/core";
import {DragHandle, ListEditor} from "components/ListEditor";
import React from 'react';
import * as L from 'partial.lenses';
import {gql, useQuery} from "services/Apollo";

import {DanceChooser} from "components/widgets/DanceChooser";
import {makeTranslate} from 'utils/translate';
import {useOnChangeForProp} from 'utils/useOnChangeForProp';
import {Button, Input, TextArea, Validate} from "libraries/forms";

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
    <Input value={name} onChange={onChangeFor('name')} required
      label={t`name`} labelInfo={t`required`} />
    <AbbreviationField value={abbreviation ?? ''} onChange={onChangeFor('abbreviation')}
      label={t`abbreviation`} helperText={t`abbreviationHelp`}
      workshopId={workshop._id} eventId={eventId}
    />
    <TextArea value={description ?? ''} onChange={onChangeFor('description')} label={t`description`} />
    <Input value={teachers ?? ''} onChange={onChangeFor('teachers')} label={t`teachers`} />
    <t.h2>dances</t.h2>
    <ListEditor items={dances} onChange={onChangeFor('dances')}
      component={DanceListItem} />
    <Validate value={dances} type="list" required />
    <div>
      {t`addDance`+' '}
      <DanceChooser value={null} onChange={dance => onChangeFor('dances')(L.set(L.appendTo, dance))} key={dances.length} />
    </div>
    </>
}

function AbbreviationField({workshopId, label, eventId, ...props}) {
  const usedWorkshopAbbreviations = useTakenWorkshopAbbreviations(eventId, workshopId);

  return <Input {...props} label={label} maxLength={3} validate={{notOneOf: usedWorkshopAbbreviations}}
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
