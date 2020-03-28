import React from 'react';
import {useModifyDance} from 'services/dances';
import {gql, useQuery} from "services/Apollo";
import {LoadingState} from 'components/LoadingState';
import {EditableMarkdown} from 'components/EditableMarkdown';
import {DanceDataImportButton} from "components/DanceDataImportDialog";
import {makeTranslate} from 'utils/translate';
import {useOnChangeForPropInValue} from 'utils/useOnChangeForProp';

import './DanceInstructions.sass';

const t = makeTranslate({
  fetchDataFromWiki: 'Hae tietoja tanssiwikistä',
  clickInstructionsToEdit: 'Klikkaa ohjetta muokataksesi sitä, voit myös hakea tietoja tanssiwikistä klikkaamalla nappeja, jotka avautuvat kun tuot hiiren tanssin päälle. Kun ohjeet ovat mieleisesi, voit joko tulostaa tämän sivun tai valita koko sivun sisällön (ohjetekstiä lukuunottamatta) ja kopioida sen haluamaasi tekstinkäsittelyohjelmaan.'
});

const GET_DANCE_INSTRUCTIONS= gql`
query DanceInstructions($eventId: ID!) {
  event(id: $eventId) {
    _id
    workshops {
      dances {
        _id
        name
        instructions
      }
    }
  }
}`;

export default function DanceInstructions({eventId}) {
  const {data, refetch, ...loadingState} = useQuery(GET_DANCE_INSTRUCTIONS, {variables: {eventId}});
  const [modifyDance] = useModifyDance();

  if (!data) return <LoadingState {...loadingState} refetch={refetch} />

  const dances = getDances(data);

  return <>
    <t.p className="dance-instructions-helptext">clickInstructionsToEdit</t.p>
    {dances.map(dance => <Dance key={dance._id} dance={dance} onChange={modifyDance}/>)}
  </>;
}

function getDances(data) {
  const dances = data.event.workshops.flatMap(w => w.dances);
  dances.sort((a,b) => a.name.localeCompare(b.name));
  return dances;
}

function Dance({dance, onChange}) {
  const onChangeFor = useOnChangeForPropInValue(onChange, dance);
  const {name, instructions} = dance;

  return <div tabIndex={0} className="dance-instructions">
    <h1>
      {name}
      {' '}
      <DanceDataImportButton text={t`fetchDataFromWiki`}
        dance={dance}
        onImport={onChange}
      />
    </h1>
    <EditableMarkdown value={instructions} onChange={onChangeFor('instructions')}
      plain maxHeight={null} />
  </div>
}
