import React, {useState} from "react";
import {Switch, Button} from "@blueprintjs/core";
import {gql, useQuery} from 'services/Apollo';
import "./DanceList.sass";
import programToSections from 'utils/programToSections';
import PrintViewToolbar from 'components/widgets/PrintViewToolbar';
import {makeTranslate} from 'utils/translate';

const t = makeTranslate({
  showSideBySide: 'Näytä setit rinnakkain',
  print: 'Tulosta'
});

function DanceList({eventId}) {
  const program = useBallProgram(eventId);
  const [sidebyside, setSidebyside] = useState(false);
  const colClass = (sidebyside ? " three-columns" : "");
  
  return program && <div className={"danceList" + colClass}>
    <PrintViewToolbar>
      <Switch inline label={t('showSideBySide')} checked={sidebyside} onChange={e => {
        setSidebyside(e.target.checked);
      }}/>
      <Button text={t('print')} onClick={() => window.print()} />
    </PrintViewToolbar>
    {program.map(
      ({name, tracks}, key) => {
        return <div key={key} className="section">
          <h2>{name}</h2>
          {tracks.map((track, i) => <p key={i}>{track.name}</p>)}
        </div>;
      }
    )}
  </div>;
}

const GET_EVENT = gql`
query getDanceList($eventId: ID!) {
  event(id: $eventId) {
    _id
    program {
      name
      type
    }
  }
}`;

function useBallProgram(eventId) {
  const {data} = useQuery(GET_EVENT, {variables: {eventId}});
  return data ? programToSections(data.event.program) : null;
}

export default DanceList;
