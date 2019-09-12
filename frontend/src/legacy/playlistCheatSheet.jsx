import React from "react";
import createClass from "create-react-class";
import "./cheatsheet.sass";
import TrackPropertyEditor from "./widgets/trackPropertyEditor";
import Fullscreenable from "./widgets/fullscreenable";
import _ from "lodash";

const PlaylistCheatSheet = createClass({
  renderTrack(track, index) {
    return (<tr key={index}>
      <td>
        <strong>{track.name}</strong>
        {this.props.mini ? null :
        <div>
          <TrackPropertyEditor multiline onSave={this.props.onTrackSave}
            track={track} property="description" addText='Lisää kuvaus' />
        </div>}
      </td>
      <td />
    </tr>);
  },
  renderPart({name, tracks}) {
    const sorted = _.clone(tracks);
    sorted.sort();
    return (<table className={this.props.mini ? 'mini' : 'normal'} key={name}>
      <thead>
        <tr>
          <th>{name}</th>
          <th className="iCanDance">Osaan tanssin</th>
        </tr>
      </thead>
      <tbody>
      {sorted.map(this.renderTrack)}
      </tbody>
    </table>);
  },
  render() {
    return (<Fullscreenable><div className="cheatsheet">
      <p>Rastita tähän, jos osaat tanssin. Näin ei tanssiaisissa tarvitse miettiä, mikä tanssi on kyseessä.</p>
      {this.props.playlist.map(this.renderPart)}
    </div></Fullscreenable>);
  }
});
export default PlaylistCheatSheet;
