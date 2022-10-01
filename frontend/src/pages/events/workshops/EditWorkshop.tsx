import {useWorkshop, useModifyWorkshop} from 'services/workshops';
import React, {useState} from 'react';
import {useParams} from 'react-router-dom';

import {AdminOnly} from 'services/users';
import {Breadcrumb, CssClass} from "libraries/ui";
import {PageTitle} from "components/PageTitle";
import {WorkshopEditor} from "components/WorkshopEditor";
import {LoadingState} from 'components/LoadingState';
import {makeTranslate} from 'utils/translate';
import {useNavigate} from "react-router-dom"
import {Form, SubmitButton} from "libraries/forms";

const t = makeTranslate({
  save: 'Tallenna',
});

export default function EditWorkshopPage({event}) {
  const {workshopId} = useParams();
  console.log(workshopId);
  const [workshop, loadingState] = useWorkshop(workshopId);

  return <AdminOnly>
    <Breadcrumb text={workshop ? workshop.name : '...'} />
    {workshop ?
        <WorkshopForm workshop={workshop} /> :
        <LoadingState {...loadingState} />
    }
  </AdminOnly>
}


function WorkshopForm({workshop}) {
  const navigate = useNavigate();
  const [modifiedWorkshop, setWorkshop] = useState(workshop);
  const [modifyWorkshop] = useModifyWorkshop({
    onCompleted: () => navigate('/events/'+workshop.eventId),
    refetchQueries: ['getEvent']
  });

  return <>
    <PageTitle>{workshop.name}</PageTitle>
    <Form className={CssClass.limitedWidth} onSubmit={() => modifyWorkshop(modifiedWorkshop)}>
      <WorkshopEditor eventId={workshop.eventId} workshop={modifiedWorkshop} onChange={setWorkshop} />
      <SubmitButton text={t`save`} />
    </Form>
  </>;
}
