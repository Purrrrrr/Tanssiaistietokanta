import {useWorkshop, useModifyWorkshop} from 'services/workshops';
import React, {useState} from 'react';

import {AdminOnly} from 'services/users';
import {Breadcrumb} from "components/Breadcrumbs";
import {WorkshopEditor} from "components/WorkshopEditor";
import {LoadingState} from 'components/LoadingState';
import {makeTranslate} from 'utils/translate';
import {navigate} from "@reach/router"
import {Form, SubmitButton} from "libraries/forms";

const t = makeTranslate({
  save: 'Tallenna',
});

export default function EditWorkshopPage({workshopId, event, uri}) {
  const [workshop, loadingState] = useWorkshop(workshopId);

  return <AdminOnly>
    <Breadcrumb text={workshop ? workshop.name : '...'} href={uri} />
    {workshop ?
        <WorkshopForm workshop={workshop} event={event} /> :
        <LoadingState {...loadingState} />
    }
  </AdminOnly>
}


function WorkshopForm({workshop}) {
  const [modifiedWorkshop, setWorkshop] = useState(workshop);
  const [modifyWorkshop] = useModifyWorkshop({
    onCompleted: () => navigate('/events/'+workshop.eventId),
    refetchQueries: ['getEvent']
  });

  return <>
    <h1>{workshop.name}</h1>
    <Form onSubmit={() => modifyWorkshop(modifiedWorkshop)}>
      <WorkshopEditor workshop={modifiedWorkshop} onChange={setWorkshop} />
      <SubmitButton text={t`save`} />
    </Form>
  </>;
}
