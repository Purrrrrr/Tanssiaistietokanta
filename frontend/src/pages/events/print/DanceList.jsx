import "./DanceList.sass";

import {Button, Switch} from "@blueprintjs/core";
import React, {useState} from "react";
import {gql, useQuery} from 'services/Apollo';

import {LoadingState} from 'components/LoadingState';
import PrintViewToolbar from 'components/widgets/PrintViewToolbar';
import {makeTranslate} from 'utils/translate';

const t = makeTranslate({
  showSideBySide: 'Näytä setit rinnakkain',
  print: 'Tulosta',
  emptyLinesAreRequestedDances: 'Tyhjät rivit ovat toivetansseja',
});

function DanceList({eventId}) {
  const {program, loadingState} = useBallProgram(eventId);
  const [sidebyside, setSidebyside] = useState(false);
  const colClass = (sidebyside ? " three-columns" : "");

  if (!program) return <LoadingState {...loadingState} />

  return <div className={"danceList" + colClass}>
    <PrintViewToolbar>
      <Switch inline label={t`showSideBySide`} checked={sidebyside} onChange={e => {
        setSidebyside(e.target.checked);
      }}/>
      <Button text={t`print`} onClick={() => window.print()} />
    </PrintViewToolbar>
    <PrintFooterContainer footer={t`emptyLinesAreRequestedDances`}>
      {program.danceSets.map(
        ({name, program}, key) => {
          return <div key={key} className="section">
            <h2>{name}</h2>
            {program.map((track, i) => <p key={i}>{track.name ?? <RequestedDance />}</p>)}
          </div>;
        }
      )}
    </PrintFooterContainer>
  </div>;
}

const RequestedDance = () => '_________________________';

function PrintFooterContainer({children, footer}) {
  return <>
    <table style={{width: '100%'}}>
      <thead><tr><td></td></tr></thead>
      <tfoot><tr><td>{footer}</td></tr></tfoot>
      <tbody><tr><td>{children}</td></tr></tbody>
    </table>
    <footer>{footer}</footer>
  </>;
}

const GET_EVENT = gql`
query getDanceList($eventId: ID!) {
  event(id: $eventId) {
    _id
    program {
      danceSets {
        name
        program {
          __typename
          ... on NamedProgram {
            name
          }
        }
      }
    }
  }
}`;

function useBallProgram(eventId) {
  const {data, ...loadingState} = useQuery(GET_EVENT, {variables: {eventId}});
  const program = data ? data.event.program : null;
  return {program, loadingState};
}

export default DanceList;
