import React from 'react';

import {PropertyEditor, required} from "./widgets/PropertyEditor";
import {EventProgramEditor} from "components/EventProgramEditor";
import {makeTranslate} from 'utils/translate';

const t = makeTranslate({
  name: 'Nimi',
  basicDetails: 'Perustiedot',
  danceProgram: 'Tanssiaisohjelma',
  nameRequired: 'Täytä nimi',
});

export function EventEditor({event, onChange}) {
  return <div>
    <t.h2>basicDetails</t.h2>
    {t`name`+" "}
    <PropertyEditor property="name" data={event} onChange={onChange} validate={required(t`nameRequired`)}/>
    <t.h2>danceProgram</t.h2>
    <EventProgramEditor event={event} onChange={onChange}/>
  </div>;
}
