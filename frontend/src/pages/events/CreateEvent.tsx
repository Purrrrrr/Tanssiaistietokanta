import React, {useState} from 'react';
import {useNavigate} from "react-router-dom"

import {useCreateEvent} from 'services/events';
import {AdminOnly} from 'services/users';
import {Breadcrumb} from "components/Breadcrumbs";
import {makeTranslate} from 'utils/translate';
import {useOnChangeForProp} from 'utils/useOnChangeForProp';
import {Input, Form, SubmitButton} from "libraries/forms";

const t = makeTranslate({
  newEventBreadcrumb: 'Uusi tapahtuma',
  newEvent: 'Luo uusi tapahtuma',
  create: 'Luo',
  name: 'Nimi',
});

export default function CreateEventForm() {
  const navigate = useNavigate();
  const [createEvent] = useCreateEvent({
    onCompleted: (data) => navigate('../'+data.createEvent._id),
    refetchQueries: ['getEvents']
  });
  const [event, setEvent] = useState({name: ''});
  const onChangeFor = useOnChangeForProp(setEvent);
  const {name} = event;

  return <AdminOnly>
    <Breadcrumb text={t`newEventBreadcrumb`} />
    <h1>{t`newEvent`}</h1>
    <Form onSubmit={() => createEvent(event)}>
      <div>
        <Input label={t`name`} value={name} onChange={onChangeFor('name')} required />
      </div>
      <SubmitButton text={t`create`} />
    </Form>
  </AdminOnly>;
}
