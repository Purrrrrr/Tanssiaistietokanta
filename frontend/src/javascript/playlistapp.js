import React from "react";
import update from 'react-addons-update';
import TrackList from "javascript/tracklist";
import "whatwg-fetch";

function getJson(response) {
  return response.json();
}
function postJson(url, data) {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
}

const PlaylistApp = React.createClass({
  getInitialState() {
    return {
      tracks: {}
    };
  },
  componentDidMount() {
    this.fetchTracks();
  },
  fetchTracks() {
    return fetch("/track").then(getJson).then(tracks => {
      this.setState({tracks});
    });
  },
  saveTrack(newTrack) {
    return postJson("/track/"+newTrack.id, newTrack).then(getJson).then(trackData => {
      var newTracks = update(this.state.tracks, {
        [trackData.id]: {$set: trackData}
      });
      this.setState({tracks: newTracks});
    });
  },
  render() {
    return <TrackList tracks={this.state.tracks} onTrackSave={this.saveTrack} />;
  }
});

export default PlaylistApp;
