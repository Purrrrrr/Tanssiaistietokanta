import React from "react";
import css from "sass/slideshow";
import Fullscreenable from "javascript/widgets/fullscreenable";
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
  renderPlaylistPart(partIndex) {
    const part = this.props.playlist[partIndex];
    return (<section className={css.slide}>
      <h1>{part.name}</h1>
      <ul>
      {part.tracks.map((track, index) => <li key={index}>{track.name}</li>)}
      </ul>
    </section>);
  },
  renderTrack(partIndex,trackIndex) {
    const part = this.props.playlist[partIndex];
    const track = part.tracks[trackIndex];
    return (<section className={css.slide}>
      <h1>{track.name}</h1>
      <p>{track.info.description}</p>
    </section>);
  },
  render() {
    const track = this.state.track;
    const part = this.state.part;
    const content = track == 0 ? 
      this.renderPlaylistPart(part) : this.renderTrack(part, track-1);
    return (<Fullscreenable><div className={css.slideshow}>
      {content}
    </div></Fullscreenable>);
  }
});
export default PlaylistSlides;
