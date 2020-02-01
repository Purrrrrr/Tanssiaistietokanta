import React, {useState} from "react";
import {Switch, Button} from "@blueprintjs/core";
import {gql, useQuery} from 'services/Apollo';
import "./DanceList.sass";
import PrintViewToolbar from 'components/widgets/PrintViewToolbar';
import {LoadingState} from 'components/LoadingState';
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
    {program.danceSets.map(
      ({name, program}, key) => {
        return <div key={key} className="section">
          <h2>{name}</h2>
          {program.map((track, i) => <p key={i}>{track.name ?? <RequestedDance />}</p>)}
        </div>;
      }
    )}
    <t.footer className="footer">emptyLinesAreRequestedDances</t.footer>
  </div>;
}

const RequestedDance = () => '_________________________';

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
            duration
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
