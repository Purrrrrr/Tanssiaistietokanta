import React, {useState} from 'react';
import {Button, Intent} from "@blueprintjs/core";
import {navigate} from "@reach/router"

import {useCreateWorkshop} from 'services/workshops';
import {showDefaultErrorToast} from "utils/toaster"
import {AdminOnly} from 'services/users';
import {Breadcrumb} from "components/Breadcrumbs";
import {ListEditor} from "components/ListEditor";
import {DanceChooser} from "components/widgets/DanceChooser";
import {PropertyEditor, required} from "components/widgets/PropertyEditor";
import {makeTranslate} from 'utils/translate';

const t = makeTranslate({
  create: 'Tallenna',
	dances: 'Tanssit',
	addDance: 'Lisää tanssi',
	name: 'Nimi',
  nameRequired: 'Täytä nimi',
  newWorkshop: 'Uusi työpaja',
});

export default function CreateWorkshopForm({event, uri}) {
  const [createWorkshop] = useCreateWorkshop({onError: showDefaultErrorToast});
  const [workshop, setWorkshop] = useState({
    dances: []
  });
	const setDances = dances => setWorkshop({...workshop, dances});

  return <AdminOnly>
    <Breadcrumb text={t("newWorkshop")} href={uri} />
    <h1>{t('newWorkshop')}</h1>
    {t('name')+" "}
    <PropertyEditor property="name" data={workshop} onChange={setWorkshop} validate={required(t('nameRequired'))}/>
    <h2>{t('dances')}</h2>
		<ListEditor items={workshop.dances} onChange={setDances}
		  component={DanceListItem} />
		<div>
			{t('addDance')+' '}
			<DanceChooser selected={null} onChange={dance => setDances([...workshop.dances, dance])} key={workshop.dances.length} />
		</div>
    <Button text={t('create')} onClick={() => createWorkshop(event._id, workshop).then(() => navigate('../..'))} />
  </AdminOnly>;
}

function DanceListItem({item, onChange, onRemove}) {
	return <>
		<DanceChooser value={item} onChange={onChange} />
    <Button intent={Intent.DANGER} text="X" onClick={onRemove} />
	</>;

}
