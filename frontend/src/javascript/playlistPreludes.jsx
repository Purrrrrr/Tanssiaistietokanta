import React from "react";
import TrackPropertyEditor from "javascript/widgets/trackPropertyEditor";
import Fullscreenable from "javascript/widgets/fullscreenable";
import css from "sass/infoTables";

const PlaylistPreludes = React.createClass({
  renderTrack(track, index) {
    return (<tr key={index}>
      <td> {track.name} </td>
      <td>
        <TrackPropertyEditor multiline onSave={this.props.onTrackSave} 
            track={track} property="info.prelude" addText='Lisää alkusoitto' />
      </td>
    </tr>);
  },
  renderPart({name, tracks}) {
    return (<table className={css.infoTable} key={name}>
      <thead>
        <tr>
          <th colSpan="2">{name}</th>
        </tr>
      </thead>
      <tbody>
        {tracks.map(this.renderTrack)}
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

export default PlaylistPreludes;
