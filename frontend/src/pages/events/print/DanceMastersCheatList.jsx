import React from 'react';
import {Button} from "@blueprintjs/core";
import {gql, useQuery} from "services/Apollo";
import {EditableDanceProperty} from "components/EditableDanceProperty";
import {LoadingState} from 'components/LoadingState';
import PrintViewToolbar from 'components/widgets/PrintViewToolbar';
import {PrintTable} from 'components/PrintTable';
import {makeTranslate} from 'utils/translate';

import './DanceMastersCheatList.sass';

const t = makeTranslate({
  print: 'Tulosta',
  noDances: 'Ei tansseja',
  addDescription: 'Lisää kuvaus',
  addPrelude: 'Lisää alkusoitto',
  introductions: 'Alkutiedotukset',
  requestedDance: 'Toivetanssi',
});

const GET_CHEAT_LIST= gql`
query getDanceMastersCheatList($eventId: ID!) {
  event(id: $eventId) {
    _id
    program {
      introductions {
        name
        duration
      }
      danceSets {
        name
        program {
          __typename
          ... on NamedProgram {
            name
            duration
          }
          ... on Dance {
            _id
            description
            prelude
          }
        }
      }
    }
  }
}`;

export default function DanceMastersCheatList({eventId}) {
  const {data, ...loadingState} = useQuery(GET_CHEAT_LIST, {variables: {eventId}});
  if (!data) return <LoadingState {...loadingState} />

  return <>
    <PrintViewToolbar>
      <Button text={t`print`} onClick={() => window.print()} />
    </PrintViewToolbar>
    <DanceMastersCheatListView program={data.event.program} />
  </>;
}

function DanceMastersCheatListView({program}) {
  const {introductions, danceSets} = program;
  return <PrintTable className="dancemasters-cheatlist">
    {introductions.length > 0 &&
      <>
        <HeaderRow>{t`introductions`}</HeaderRow>
        {introductions.map((item, i) => 
            <SimpleRow key={i} text={item.name} />
        )}
      </>
    }
    {danceSets.map(({name, program}, index) =>
      <React.Fragment key={index}>
        <HeaderRow>{name}</HeaderRow>
        {program.map((item, i) => {
          switch(item.__typename) {
            case 'Dance':
              return <DanceRow key={i} dance={item} />;
            case 'RequestedDance':
              return <SimpleRow key={i} text={t`requestedDance`} />;
            default:
              return <SimpleRow key={i} className="info" text={item.name} />;
          }
        })}
      </React.Fragment>
    )}
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

function HeaderRow({children}) {
  return <tr className="header"><th colSpan={3}>{children}</th></tr>
}

function SimpleRow({className, text}) {
  return <tr className={className}><td colSpan={3}>{text}</td></tr>
}
