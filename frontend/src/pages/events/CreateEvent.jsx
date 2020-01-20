import React, {useState} from 'react';
import {Button, Intent} from "@blueprintjs/core";
import {navigate} from "@reach/router"

import {useCreateEvent} from 'services/events';
import {AdminOnly} from 'services/users';
import {PropertyEditor, required} from "components/widgets/PropertyEditor";
import {Breadcrumb} from "components/Breadcrumbs";
import {makeTranslate} from 'utils/translate';

const t = makeTranslate({
  newEventBreadcrumb: 'Uusi tapahtuma',
  newEvent: 'Luo uusi tapahtuma',
  create: 'Luo',
  name: 'Nimi',
  nameRequired: 'Täytä nimi',
});

export default function CreateEventForm({uri}) {
  const [createEvent] = useCreateEvent();
  const [event, setEvent] = useState({
    program: []
  });

  return <AdminOnly>
    <Breadcrumb text={t`newEventBreadcrumb`} href={uri} />
    <h1>{t`newEvent`}</h1>
    <div>
      {t`name`+" "}
      <PropertyEditor property="name" data={event} onChange={setEvent} validate={required(t`nameRequired`)}/>
    </div>
    <Button intent={Intent.PRIMARY} text={t`create`} onClick={() => createEvent(event).then(
      ({data}) => navigate(data.createEvent._id))
    } />
  </AdminOnly>;
}
