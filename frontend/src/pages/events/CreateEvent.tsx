import React, {useState} from 'react';
import {useNavigate} from "react-router-dom"

import {useCreateEvent} from 'services/events';
import {AdminOnly} from 'services/users';
import {Breadcrumb} from "libraries/ui";
import {PageTitle} from "components/PageTitle";
import {makeTranslate} from 'utils/translate';
import {Input, fieldFor, Form, SubmitButton} from "libraries/forms2";

const t = makeTranslate({
  newEventBreadcrumb: 'Uusi tapahtuma',
  newEvent: 'Luo uusi tapahtuma',
  create: 'Luo',
  name: 'Nimi',
});

const Field = fieldFor<{name: string}>()

export default function CreateEventForm() {
  const navigate = useNavigate();
  const [createEvent] = useCreateEvent({
    onCompleted: (data) => navigate('../'+data.createEvent._id),
    refetchQueries: ['getEvents']
  });
  const [event, setEvent] = useState({name: ''});

  return <AdminOnly>
    <Breadcrumb text={t`newEventBreadcrumb`} />
    <PageTitle>{t`newEvent`}</PageTitle>
    <Form value={event} onChange={setEvent} onSubmit={() => createEvent(event)}>
      <div>
        <Field label={t`name`} path="name" component={Input} required />
      </div>
      <SubmitButton text={t`create`} />
    </Form>
  </AdminOnly>;
}
