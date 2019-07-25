import React from "react";
import "./danceList.sass";
import Fullscreenable from "./widgets/fullscreenable";
import _ from "lodash";

function DanceList(props) {
  return (<Fullscreenable><div className={props.sidebyside ? "sidebysideList" : "danceList"}>
      {props.playlist.map(
        ({name, tracks}) => {
          const sorted = _.clone(tracks);
          sorted.sort();
          return (<div>
            <h2>{name}</h2>
            {sorted.map((track) => <p>{track.name}</p>)}
          </div>);
        }
      )}
  </div></Fullscreenable>);
}

export default DanceList;
