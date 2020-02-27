import React, {useState} from 'react';
import {Button, Intent} from "@blueprintjs/core";
import {navigate} from "@reach/router"

import {useCreateEvent} from 'services/events';
import {AdminOnly} from 'services/users';
import {Breadcrumb} from "components/Breadcrumbs";
import {makeTranslate} from 'utils/translate';
import {useOnChangeForProp} from 'utils/useOnChangeForProp';
import {Validate, useValidationResult} from "libraries/form-validation";
import {BasicInput} from "libraries/form-inputs";

const t = makeTranslate({
  newEventBreadcrumb: 'Uusi tapahtuma',
  newEvent: 'Luo uusi tapahtuma',
  create: 'Luo',
  name: 'Nimi',
});

export default function CreateEventForm({uri}) {
  const [createEvent] = useCreateEvent();
  const [event, setEvent] = useState({name: ''});
  const onChangeFor = useOnChangeForProp(setEvent);
  const {name} = event;
  const {hasErrors, ValidationContainer} = useValidationResult();

  return <AdminOnly>
    <Breadcrumb text={t`newEventBreadcrumb`} href={uri} />
    <h1>{t`newEvent`}</h1>
    <ValidationContainer>
      <div>
        {t`name`+" "}
        <BasicInput value={name} onChange={onChangeFor('name')} />
        <Validate value={name} required />
      </div>
    </ValidationContainer>
    <Button intent={Intent.PRIMARY} text={t`create`}
      disabled={hasErrors}
      onClick={() => createEvent(event).then(
        ({data}) => navigate(data.createEvent._id))
    } />
  </AdminOnly>;
}
