import React from "react";
import css from "sass/cheatsheet";
import TrackPropertyEditor from "javascript/widgets/trackPropertyEditor";
import Fullscreenable from "javascript/widgets/fullscreenable";
import _ from "lodash";

const PlaylistCheatSheet = React.createClass({
  renderTrack(track, index) {
    return (<tr key={index}>
      <td>
        <strong>{track.name}</strong>
        <div>
          <TrackPropertyEditor multiline onSave={this.props.onTrackSave} 
            track={track} property="info.description" addText='Lisää kuvaus' />
        </div>
      </td>
      <td />
    </tr>);
  },
  renderPart({name, tracks}) {
    const sorted = _.clone(tracks);
    sorted.sort();
    return (<table key={name}>
      <thead>
        <tr>
          <th>{name}</th>
          <th className={css.iCanDance}>Osaan tanssin</th>
        </tr>
      </thead>
      <tbody>
      {sorted.map(this.renderTrack)}
      </tbody>
    </table>);
  },
  render() {
    return (<Fullscreenable><div className={css.cheatsheet}>
      <p>Rastita tähän, jos osaat tanssin. Näin ei tanssiaisissa tarvitse miettiä, mikä tanssi on kyseessä.</p>
      {this.props.playlist.map(this.renderPart)}
    </div></Fullscreenable>);
  }
});
export default PlaylistCheatSheet;
