import React, {useState} from 'react';
import {navigate} from "@reach/router"
import {Button, Intent} from "@blueprintjs/core";
import {Breadcrumb} from "components/Breadcrumbs";

import {NavigateButton} from "components/widgets/NavigateButton";
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
    <hr />
    <Button intent={Intent.PRIMARY} text="Tallenna muutokset"
      onClick={() => modifyEvent(currentEvent).then(() => navigate('/events/'+event._id))}  />
    <NavigateButton href={'/events/'+event._id} text="Peruuta" />
  </AdminOnly>;
}
