import React from "react";
import {noop, map} from "lodash";
import update from 'react-addons-update';
//import css from "sass/trackeditor";

const TrackEditor = React.createClass({
  propTypes: {
    onSave: React.PropTypes.func
  },
  getDefaultProps() {
    return {
      onSave: noop
    };
  },
  getInitialState() {
    return {
      track: this.props.track,
    };
  },
  modifyName(event) {
    const track = update(this.state.track, {
      name: {$set: event.target.value}
    });
    this.setState({track});
  },
  modifyInfo (event) {
    const key = event.target.name;
    const track = update(this.state.track, {
      info: { [key]: {$set: event.target.value}}
    });
    this.setState({track});
  },
  save(event) {
    event.preventDefault();
    this.props.onSave(this.state.track);
  },
  render() {
    const infoFields = {
      prelude: "Alkusoitto",
      description: "Lyhyt kuvaus",
      formation: "Kuvio",
      remarks: "Huomautuksia"
    };

    return (<form onSubmit={this.save}><fieldset>
      <div><label>Nimi: </label><input value={this.state.track.name} onChange={this.modifyName} /></div>
      {map(infoFields, (label, key) => 
        <div key={key}><label>{label}</label><input name={key} value={this.state.track.info[key] || ""} onChange={this.modifyInfo} /></div>
      )}
      <button type="submit">Save </button>
    </fieldset></form>);
  }
});
export default TrackEditor;
