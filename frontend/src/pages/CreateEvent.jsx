import React, {useState} from 'react';
import {Button} from "@blueprintjs/core";
import {navigate} from "@reach/router"

import {useCreateEvent} from '../services/events';
import {showDefaultErrorToast} from "../utils/toaster"
import {AdminOnly} from '../services/users';
import {Breadcrumb} from "../components/Breadcrumbs";
import {EventEditor} from "../components/EventEditor";
import {makeTranslate} from '../utils/translate';

const t = makeTranslate({
  newEvent: 'Luo uusi tapahtuma',
});

export default function CreateEventForm({uri}) {
  const [createEvent] = useCreateEvent({onError: showDefaultErrorToast});
  const [event, setEvent] = useState({
    program: []
  });

  return <AdminOnly>
    <Breadcrumb text="Uusi tapahtuma" href={uri} />
    <h1>{t('newEvent')}</h1>
    <EventEditor event={event} onChange={setEvent} />
    <Button text="Luo" onClick={() => createEvent(event).then(
      ({data}) => navigate(data.createEvent._id))
    } />
  </AdminOnly>;
}
