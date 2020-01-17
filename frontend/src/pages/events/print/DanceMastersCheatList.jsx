import React from 'react';
import {Button} from "@blueprintjs/core";
import {gql, useQuery} from "services/Apollo";
import {EditableDanceProperty} from "components/EditableDanceProperty";
import PrintViewToolbar from 'components/widgets/PrintViewToolbar';
import {PrintTable} from 'components/PrintTable';
import {makeTranslate} from 'utils/translate';

import './DanceMastersCheatList.sass';

const t = makeTranslate({
  print: 'Tulosta',
  noDances: 'Ei tansseja',
  addDescription: 'Lisää kuvaus',
  addPrelude: 'Lisää alkusoitto',
});

const GET_CHEAT_LIST= gql`
query getDanceMastersCheatList($eventId: ID!) {
  event(id: $eventId) {
    _id
    program {
      name
      type
      dance{
        _id
        name
        description
        prelude
      }
    }
  }
}`;

export default function DanceMastersCheatList({eventId}) {
  const {data} = useQuery(GET_CHEAT_LIST, {variables: {eventId}});
  if (!data) return '...';
  
  return <>
    <PrintViewToolbar>
      <Button text={t('print')} onClick={() => window.print()} />
    </PrintViewToolbar>
    <DanceMastersCheatListView program={data.event.program} />
  </>;
}

function DanceMastersCheatListView({program}) {
  return <PrintTable className="dancemasters-cheatlist">
    {program.map((item, i) => {
      switch(item.type) {
        case 'DANCE': 
          return <DanceRow key={i} dance={item.dance} />;
        case 'HEADER': 
          return <tr className="header" key={i}><th colSpan={3}>{item.name}</th></tr>
        default:
          return <tr className="info" key={i}><td colSpan={3}>{item.name}</td></tr>
      }
    })}
  </PrintTable>;
}

function DanceRow({dance}) {
  return <tr>
    <td>{dance.name}</td>
    <td>
      <EditableDanceProperty dance={dance} property="description" addText={t`addDescription`} multiline />
    </td>
    <td>
      <EditableDanceProperty dance={dance} property="prelude" addText={t`addPrelude`} multiline />
    </td>
  </tr>

}
