import React from "react";
import update from 'react-addons-update';
import TrackList from "javascript/tracklist";
import PlaylistCheatSheet from "javascript/playlistCheatSheet";
import {fetchJson, postJson} from "javascript/util/ajax";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

const PlaylistApp = React.createClass({
  getInitialState() {
    return {
      tracks: {},
      playlists: {},
      playlist: [],
      currentTab: 0
    };
  },
  componentDidMount() {
    this.fetchTracks();
    this.fetchPlaylists();
  },
  fetchTracks() {
    return fetchJson("/track").then(tracks => {
      this.setState({tracks});
    });
  },
  fetchPlaylists() {
    return fetchJson("/playlist").then(playlists => {
      var key;
      for (key in playlists) break;
      this.setState({playlists, playlist: playlists[key]});
    });
  },
  saveTrack(newTrack) {
    return postJson("/track/"+newTrack.id, newTrack).then(trackData => {
      var newTracks = update(this.state.tracks, {
        [trackData.id]: {$set: trackData}
      });
      this.setState({tracks: newTracks});
    });
  },
  render() {
    return (<Tabs selectedIndex={this.state.currentTab} onSelect={currentTab => this.setState({currentTab})}>
        <TabList>
          <Tab>Biisit</Tab>
          <Tab>Listat</Tab>
          <Tab>Lunttilappu</Tab>
        </TabList>
        <TabPanel>
          <TrackList tracks={this.state.tracks} onTrackSave={this.saveTrack} />
        </TabPanel>
        <TabPanel>
          ?
        </TabPanel>
        <TabPanel>
          <PlaylistCheatSheet playlist={this.state.playlist} trackData={this.state.tracks} onTrackSave={this.saveTrack} />
        </TabPanel>
      </Tabs>);
  }
});

export default PlaylistApp;
