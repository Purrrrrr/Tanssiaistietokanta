import {useCreateWorkshop} from 'services/workshops';
import React, {useState} from 'react';

import {AdminOnly} from 'services/users';
import {Breadcrumb} from "components/Breadcrumbs";
import {PageTitle} from "components/PageTitle";
import {WorkshopEditor} from "components/WorkshopEditor";
import {makeTranslate} from 'utils/translate';
import {useNavigate} from "react-router-dom"
import {Form, SubmitButton} from "libraries/forms";

const t = makeTranslate({
  create: 'Tallenna',
  newWorkshop: 'Uusi työpaja',
});

export default function CreateWorkshopForm({event}) {
  const navigate = useNavigate();
  const [workshop, setWorkshop] = useState({
    name: '',
    dances: []
  });
  const [createWorkshop] = useCreateWorkshop({
    onCompleted: (data) => navigate('/events/'+event._id),
    refetchQueries: ['getEvent']
  });

  return <AdminOnly>
    <Breadcrumb text={t`newWorkshop`} />
    <PageTitle>{t`newWorkshop`}</PageTitle>
    <Form onSubmit={() => createWorkshop(event._id, workshop)}>
      <WorkshopEditor eventId={event._id} workshop={workshop} onChange={setWorkshop} />
      <SubmitButton text={t`create`} />
    </Form>
  </AdminOnly>;
}
