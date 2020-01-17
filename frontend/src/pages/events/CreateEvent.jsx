import React, {useState} from 'react';
import {Button} from "@blueprintjs/core";
import {navigate} from "@reach/router"

import {useCreateEvent} from 'services/events';
import {AdminOnly} from 'services/users';
import {Breadcrumb} from "components/Breadcrumbs";
import {EventEditor} from "components/EventEditor";
import {makeTranslate} from 'utils/translate';

const t = makeTranslate({
  newEventBreadcrumb: 'Uusi tapahtuma',
  newEvent: 'Luo uusi tapahtuma',
  create: 'Luo',
});

export default function CreateEventForm({uri}) {
  const [createEvent] = useCreateEvent();
  const [event, setEvent] = useState({
    program: []
  });

  return <AdminOnly>
    <Breadcrumb text={t`newEventBreadcrumb`} href={uri} />
    <h1>{t`newEvent`}</h1>
    <EventEditor event={event} onChange={setEvent} />
    <Button text={t`create`} onClick={() => createEvent(event).then(
      ({data}) => navigate(data.createEvent._id))
    } />
  </AdminOnly>;
}
