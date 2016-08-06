import React from "react";
import css from "sass/slideshow";
import Fullscreenable from "javascript/widgets/fullscreenable";
import TrackPropertyEditor from "javascript/widgets/trackPropertyEditor";
//import _ from "lodash";

const PlaylistSlides = React.createClass({
  getInitialState() {
    return {
      part: 0,
      track: 0
    };
  },
  componentWillMount(){
    document.addEventListener("keydown", this.keyPress, false);
  },
  componentWillUnmount() {
    document.removeEventListener("keydown", this.keyPress, false);
  },
  keyPress(e) {
    const tag = e.target.tagName;
    if (tag == "INPUT") return;
    if (e.keyCode == 37) this.previousSlide();
    if (e.keyCode == 39) this.nextSlide();
  },
  nextSlide() {
    const currentPart = this.props.playlist[this.state.part];
    if (this.state.track < currentPart.tracks.length) {
      this.setState({track: this.state.track + 1});
    } else if (this.state.part < this.props.playlist.length-1){
      this.setState({part: this.state.part + 1, track: 0});
    }
  },
  previousSlide() {
    if (this.state.track > 0) {
      this.setState({track: this.state.track - 1});
    } else if (this.state.part > 0){
      const prevPart = this.state.part - 1;
      const prevTracks = this.props.playlist[prevPart].tracks;
      this.setState({part: prevPart, track: prevTracks.length});
    }
  },
  changePart(event) {
    this.setState({part: event.target.value, track: 0});
  },
  changeTrack(track) {
    this.setState({track});
  },
  renderPlaylistPart(partIndex) {
    const part = this.props.playlist[partIndex];
    return (<section className={css.slide}>
      <h1>{part.name}</h1>
      <ul>
      {part.tracks.filter(t => t.name != "Taukomusiikkia").map((track, index) => <li onClick={() => this.changeTrack(index+1)} key={index}>{track.name}</li>)}
      </ul>
    </section>);
  },
  renderTrack(partIndex,trackIndex) {
    const part = this.props.playlist[partIndex];
    const tracks = part.tracks;
    const track = tracks[trackIndex];
    const nextTrack = trackIndex+1 < tracks.length ? tracks[trackIndex+1] : null;
    const nextTrackInfo = nextTrack ? 
    (<section className={css.nextTrack}>
      <h1>Tämän jälkeen:{" "+nextTrack.name}</h1>
      <div>{nextTrack.info.description}</div>
      </section>) : null;

    const teachingSet = track.info.teachingSet ? <p>Opetettu setissä {track.info.teachingSet}</p> : null;
    return (<section className={css.slide}>
      <h1>{track.name}</h1>
      <p>
        <TrackPropertyEditor multiline onSave={this.props.onTrackSave} 
          track={track} property="info.description" addText='Lisää kuvaus' />
      </p>
      {teachingSet}
      {nextTrackInfo}

    </section>);
  },
  render() {
    const track = this.state.track;
    const part = this.state.part;
    const content = track == 0 ? 
      this.renderPlaylistPart(part) : this.renderTrack(part, track-1);
    return (<Fullscreenable><div className={css.slideshow}>
      <select value={part} onChange={this.changePart}>
      {this.props.playlist.map((part,i) => <option key={i} value={i}>{part.name}</option>)}
      </select>
      {content}
    </div></Fullscreenable>);
  }
});
export default PlaylistSlides;
