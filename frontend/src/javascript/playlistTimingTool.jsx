import React from "react";
import createClass from "create-react-class";
import _ from "lodash";
import "./infoTables.sass";

function length(secs) {
  if (!secs) return "0:00";
  const length = Math.round(secs);
  const sec = length%60;
  const min = (length-sec)/60;
  return min+":"+(sec < 10 ? "0"+sec : sec);
}

const PlaylistTimingTool = createClass({
  getInitialState() {
    return {
      biisiTauko: 3,
      settiTauko: 15,
    };
  },
  renderTrack(track, index) {
    return (<tr key={index}>
      <td> {track.name} </td>
      <td>{length(track.length)}</td>
    </tr>);
  },
  renderPart({name, tracks}) {
    const total = _.sumBy(tracks, track => track.length) || 0;
    const totalWithPauses = total + 
      (tracks.length - 1) * this.state.biisiTauko*60 +
      this.state.settiTauko*60;
    return (<table  className="infoTable" key={name}>
      <thead>
        <tr>
          <th colSpan="2">{name} ({tracks.length} tanssia)</th>
        </tr>
      </thead>
      <tbody>
        {tracks.map(this.renderTrack)}
        <tr>
          <th>Yhteensä</th>
          <th>{length(total)}</th>
        </tr>
        <tr>
          <th>Yhteensä taukoineen</th>
          <th>{length(totalWithPauses)}</th>
        </tr>
      </tbody>
    </table>);
  },
  render() {
    return (<div>
      <div>
        Biisitauko:&nbsp;
        <input value={this.state.biisiTauko} onChange={(e) => this.setState({biisiTauko: e.target.value})} />&nbsp;
        Settitauko: &nbsp;
        <input value={this.state.settiTauko} onChange={(e) => this.setState({settiTauko: e.target.value})} />
      </div>
      {this.props.playlist.map(this.renderPart)}
    </div>);
  }
});

export default PlaylistTimingTool;
