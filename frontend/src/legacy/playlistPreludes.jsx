import React from "react";
import createClass from "create-react-class";
import TrackPropertyEditor from "./widgets/trackPropertyEditor";
import Fullscreenable from "./widgets/fullscreenable";
import "./infoTables.sass";

const PlaylistPreludes = createClass({
  renderPart({name, tracks}) {
    return (<table className="infoTable" key={name}>
      <thead>
        <tr>
          <th colSpan="2">{name}</th>
        </tr>
      </thead>
      <tbody>
        {tracks.map((track, index) => <Track key={index} track={track} onSave={this.props.onTrackSave} />)}
      </tbody>
    </table>);
  },
  render() {
    return (<Fullscreenable>
      <h1>Alkusoitot</h1>
      {this.props.playlist.map(this.renderPart)}
    </Fullscreenable>);
  }
});

function Track({track, onSave}) {
  return <tr>
    <td> {track.name} </td>
    <td>
      <TrackPropertyEditor multiline onSave={onSave}
        track={track} property="prelude" addText='Lisää alkusoitto' />
    </td>
  </tr>;
}

export default PlaylistPreludes;
