import React from "react";
import createClass from "create-react-class";
import TrackList from "./tracklist";
import PlaylistEditor from "./playlistEditor";
import PlaylistCheatSheet from "./playlistCheatSheet";
import PlaylistPreludes from "./playlistPreludes";
import PlaylistSlides from "./playlistSlides";
import DanceList from "./danceList";
import {fetchJson, putJson} from "./util/ajax";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import "react-tabs/style/react-tabs.css";
import _ from "lodash";
import "./playlistapp.sass";

import {Breadcrumb} from "../components/Breadcrumbs";

const PlaylistApp = createClass({
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
    if (tag === "INPUT") return;
    if (e.keyCode === 82) this.reload();
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
    return fetchJson("dances").then(tracks => {
      this.setState({tracks});
    });
  },
  fetchPlaylists() {
    return fetchJson("events").then(events => {
      const playlists = {};
      events.forEach(({name, program})=> {
        playlists[name] = toParts(program, this.state.tracks);
      });
      this.setState({playlists});
    });
  },
  reload() {
    this.fetchTracks()
      .then(() => this.fetchPlaylists());
  },
  saveTrack(newTrack) {
    return putJson("dances/"+newTrack._id, newTrack).then(() => {
      this.reload();
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
      <Breadcrumb text="LegacyTanssittaja" href={this.props.uri} />
      <div className="toolbar"><button onClick={this.reload}>Lataa biisitiedot uusiksi</button> | Valitse settilista: {this.renderPlaylistChooser()}</div>
      <Tabs className="playlistapp" selectedIndex={this.state.currentTab} onSelect={currentTab => this.setState({currentTab})}>
        <TabList>
          <Tab>Biisit</Tab>
          <Tab>Listan tiedot</Tab>
          <Tab>Alkusoitot</Tab>
          <Tab>Lunttilappu</Tab>
          <Tab>Minilunttilappu</Tab>
          <Tab>Tanssilista</Tab>
          <Tab>Tanssilista (vierekkäin)</Tab>
          <Tab>Listadiashow</Tab>
        </TabList>
        <TabPanel>
          <TrackList tracks={this.state.tracks} onTrackSave={this.saveTrack} />
        </TabPanel>
        <TabPanel>
          <PlaylistEditor playlist={this.state.playlists[this.state.playlist]} onTrackSave={this.saveTrack}/>
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
          <DanceList playlist={this.state.playlists[this.state.playlist]} sidebyside={true}/>
        </TabPanel>
        <TabPanel>
          <PlaylistSlides playlist={this.state.playlists[this.state.playlist]} onTrackSave={this.saveTrack} />
        </TabPanel>
      </Tabs></div>);
  }
});

function toParts(program, dances) {
  let currentPart = null;
  const parts = [];
  program.forEach(item => {
    if (item.type === 'DANCE') {
      const [dance] = dances.filter(({_id}) => _id === item.danceId);
      const danceItem = dance ? {...item, ...dance} : item;
      currentPart.tracks.push(danceItem);
    } else {
      if (currentPart) parts.push(currentPart);
      currentPart = {name: item.name, tracks: []}
    }
  });
  if (currentPart) parts.push(currentPart);

  return parts;
}

export default PlaylistApp;
