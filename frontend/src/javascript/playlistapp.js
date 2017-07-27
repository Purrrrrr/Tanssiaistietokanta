import React from "react";
import update from 'react-addons-update';
import TrackList from "javascript/tracklist";
import PlaylistTimingTool from "javascript/playlistTimingTool";
import PlaylistCheatSheet from "javascript/playlistCheatSheet";
import PlaylistPreludes from "javascript/playlistPreludes";
import PlaylistSlides from "javascript/playlistSlides";
import DanceList from "javascript/danceList";
import {fetchJson, postJson} from "javascript/util/ajax";
import "whatwg-fetch";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import _ from "lodash";
import css from "sass/playlistapp";

const PlaylistApp = React.createClass({
  getInitialState() {
    return {
      tracks: {},
      playlists: {},
      playlist: "",
      currentTab: 0
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
    if (e.keyCode == 82) this.reload();
  },
  componentDidMount() {
    this.fetchTracks();
    this.fetchPlaylists().then(() => {
      const {playlists} = this.state;
      const keys = _.keys(playlists);
      if (keys.length) {
        this.setState({playlist: keys[0]});
      }
    });
  },
  fetchTracks() {
    return fetchJson("track").then(tracks => {
      this.setState({tracks});
    });
  },
  fetchPlaylists() {
    return fetchJson("playlist").then(playlists => {
      this.setState({playlists});
    });
  },
  reload() {
    return fetch("reload").then(() => {
      this.fetchTracks();
      this.fetchPlaylists();
    });
  },
  saveTrack(newTrack) {
    return postJson("track/"+newTrack.id, newTrack).then(trackData => {
      var newTracks = update(this.state.tracks, {
        [trackData.id]: {$set: trackData}
      });
      this.setState({tracks: newTracks});
      //It's easier to just fetch the playlists again than update the data
      this.fetchPlaylists();
    });
  },
  choosePlaylist(event) {
    this.setState({playlist: event.target.value});
  },
  renderPlaylistChooser() {
    return (<select value={this.state.playlist} onChange={this.choosePlaylist}>
      {_.map(this.state.playlists, (list, key) => <option key={key} value={key}>{key}</option>)}
    </select>);
  },
  render() {
    return (<div>
      <div className={css.toolbar}><button onClick={this.reload}>Lataa biisitiedot uusiksi</button> | Valitse settilista: {this.renderPlaylistChooser()}</div>
      <Tabs className={css.playlistapp} selectedIndex={this.state.currentTab} onSelect={currentTab => this.setState({currentTab})}>
        <TabList>
          <Tab>Biisit</Tab>
          <Tab>Listan ajastus</Tab>
          <Tab>Alkusoitot</Tab>
          <Tab>Lunttilappu</Tab>
          <Tab>Minilunttilappu</Tab>
          <Tab>Tanssilista</Tab>
          <Tab>Listadiashow</Tab>
        </TabList>
        <TabPanel>
          <TrackList tracks={this.state.tracks} onTrackSave={this.saveTrack} />
        </TabPanel>
        <TabPanel>
          <PlaylistTimingTool playlist={this.state.playlists[this.state.playlist]} onTrackSave={this.saveTrack}/>
        </TabPanel>
        <TabPanel>
          <PlaylistPreludes playlist={this.state.playlists[this.state.playlist]} onTrackSave={this.saveTrack}/>
        </TabPanel>
        <TabPanel>
          <PlaylistCheatSheet playlist={this.state.playlists[this.state.playlist]} onTrackSave={this.saveTrack}/>
        </TabPanel>
        <TabPanel>
          <PlaylistCheatSheet mini={true} playlist={this.state.playlists[this.state.playlist]} onTrackSave={this.saveTrack}/>
        </TabPanel>
        <TabPanel>
          <DanceList playlist={this.state.playlists[this.state.playlist]}/>
        </TabPanel>
        <TabPanel>
          <PlaylistSlides playlist={this.state.playlists[this.state.playlist]} onTrackSave={this.saveTrack} />
        </TabPanel>
      </Tabs></div>);
  }
});

export default PlaylistApp;
