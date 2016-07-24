import React from "react";
import css from "sass/cheatsheet";
import _ from "lodash";

const PlaylistCheatSheet = React.createClass({
  renderTrack(trackName, index) {
    var track = _.find(this.props.trackData, 
      (candidate) => candidate.fileName == trackName);
    if (!track) track = {name: trackName};
    
    return (<tr key={index}>
      <td><strong>{track.name}</strong>{track.description}</td>
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
    return (<div className={css.cheatsheet}>
      <p>Rastita tähän, jos osaat tanssin. Näin ei tanssiaisissa tarvitse miettiä, mikä tanssi on kyseessä.</p>
      {this.props.playlist.map(this.renderPart)}
    </div>);
  }
});
export default PlaylistCheatSheet;
