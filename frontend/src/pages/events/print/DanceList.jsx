import React, {useState} from "react";
import {Switch} from "@blueprintjs/core";
import {gql, useQuery} from 'services/Apollo';
import "./DanceList.sass";
import programToSections from 'utils/programToSections';
import PrintViewToolbar from 'components/widgets/PrintViewToolbar';

function DanceList({eventId}) {
  const program = useBallProgram(eventId);
  const [sidebyside, setSidebyside] = useState(false);
  const colClass = (sidebyside ? " three-columns" : "");
  
  return program && <div className={"danceList" + colClass}>
    <PrintViewToolbar>
      <Switch label="Näytä setit rinnakkain" checked={sidebyside} onChange={e => {
        setSidebyside(e.target.checked);
      }}/>
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
query getEvent($eventId: ID!) {
  event(id: $eventId) {
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
