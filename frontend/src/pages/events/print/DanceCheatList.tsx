import React, {useState} from 'react';
import classNames from 'classnames';
import {Switch, Button} from "libraries/forms";
import {gql, useQuery} from "services/Apollo";
import {EditableDanceProperty} from "components/EditableDanceProperty";
import PrintViewToolbar from 'components/widgets/PrintViewToolbar';
import {PrintTable} from 'components/PrintTable';
import {LoadingState} from 'components/LoadingState';
import {CenteredContainer} from 'components/CenteredContainer';
import {makeTranslate} from 'utils/translate';
import {PageTitle} from "components/PageTitle";

import './DanceCheatList.sass';

const t = makeTranslate({
  helpText: 'Rastita tähän, jos osaat tanssin. Näin ei tanssiaisissa tarvitse miettiä, mikä tanssi on kyseessä.',
  showHelpText: 'Näytä ohjeteksti',
  miniView: 'Tiivistetty näkymä',
  print: 'Tulosta',
  noDances: 'Ei tansseja',
  addDescription: 'Lisää kuvaus',
  iCanDanceThis: 'Osaan tanssin',
  danceName: 'Nimi',
});

const GET_CHEAT_LIST= gql`
query DanceCheatList($eventId: ID!) {
  event(id: $eventId) {
    _id
    workshops {
      _id
      name
      dances {
        _id
        name
        description
      }
    }
  }
}`;

export default function DanceCheatList({eventId}) {
  const [mini, setMini] = useState(false);
  const [helpText, setHelptext] = useState(true);
  const {data, ...loadingState} = useQuery(GET_CHEAT_LIST, {variables: {eventId}});
  if (!data) return <LoadingState {...loadingState} />

  return <>
    <PrintViewToolbar>
      <Switch inline label={t`miniView`} checked={mini} onChange={e => {
        setMini((e.target as HTMLInputElement).checked);
      }}/>
      <Switch inline label={t`showHelpText`} checked={helpText} onChange={e => {
        setHelptext((e.target as HTMLInputElement).checked);
      }}/>
      <Button text={t`print`} onClick={() => window.print()} />
    </PrintViewToolbar>
    <DanceCheatListView workshops={data.event.workshops} mini={mini} helpText={helpText} />
  </>;
}

function DanceCheatListView({workshops, mini, helpText}) {
  return <CenteredContainer className={classNames('dance-cheatsheet', {mini})}>
    {helpText && <p>{t`helpText`}</p>}
    {workshops.map(workshop =>
      <WorkshopDances key={workshop._id} workshop={workshop} mini={mini} />)}
  </CenteredContainer>;
}

function WorkshopDances({workshop, mini}) {
  const {name, dances} = workshop;
  return <>
    <PageTitle>{name}</PageTitle>
    {dances.length === 0 ?
      <t.p>noDances</t.p> :
      <PrintTable headings={[t`danceName`, t`iCanDanceThis`]}>
        {dances.map(dance =>
          <tr key={dance._id}>
            <td>
              {mini
                  ? dance.name
                  : <>
                  <strong>{dance.name}</strong>
                  <div>
                    <EditableDanceProperty dance={dance} property="description" addText={t`addDescription`} />
                  </div>
                  </>
              }
            </td>
            <td />
          </tr>
        )}
      </PrintTable>
    }
  </>;
}
