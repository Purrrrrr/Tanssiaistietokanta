import React from "react";
import {noop} from "lodash";
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
  save() {
    this.props.onSave(this.state.track);
  },
  render() {
    return (<fieldset>
      <label>Name: </label><input value={this.state.track.name} onChange={this.modifyName} />
      <label>Remarks: </label><input name="remarks" value={this.state.track.info.remarks || ""} onChange={this.modifyInfo} />
      <button onClick={this.save}>Save </button>
    </fieldset>);
  }
});
export default TrackEditor;
