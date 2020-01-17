import React, {useState} from 'react';
import {Button} from "@blueprintjs/core";
import {Breadcrumb} from "components/Breadcrumbs";

import {EventProgramEditor} from "components/EventProgramEditor";
import {useModifyEvent} from 'services/events';
import {AdminOnly} from 'services/users';

export default function EventEditorPage({event, uri}) {
  const [currentEvent, setCurrentEvent] = useState(event);
  const [modifyEvent] = useModifyEvent();

  return <AdminOnly fallback="you need to be admin">
    <Breadcrumb text="Tanssiaisohjelma" href={uri} />
    <h1>Muokkaa tanssiaisohjelmaa</h1>
    <EventProgramEditor event={currentEvent} onChange={setCurrentEvent}/>
    <Button text="Tallenna muutokset" onClick={() => modifyEvent(currentEvent)} />
  </AdminOnly>;
}
