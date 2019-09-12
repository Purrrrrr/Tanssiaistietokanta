import React from "react";
import createClass from "create-react-class";
import EditableText from "./editableText";
import _ from "lodash";

const TrackPropertyEditor = createClass({
  onSave(val) {
    if (!this.props.track._id) return;
    const newTrack = _.clone(this.props.track);
    _.set(newTrack, this.props.property, val);
    
    this.props.onSave(newTrack);
  },
  render() {
    const val = _.get(this.props.track, this.props.property);
    return <EditableText key={this.props.track._id} multiline={this.props.multiline} onSave={this.onSave} value={val} addText={this.props.addText} />;
  }
});

export default TrackPropertyEditor;
