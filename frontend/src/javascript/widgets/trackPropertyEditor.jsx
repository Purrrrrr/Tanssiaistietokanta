import React from "react";
import EditableText from "javascript/widgets/editableText";
import _ from "lodash";

const TrackPropertyEditor = React.createClass({
  onSave(val) {
    if (!this.props.track.id) return;
    const newTrack = _.clone(this.props.track);
    _.set(newTrack, this.props.property, val);
    
    this.props.onSave(newTrack);
  },
  render() {
    const val = _.get(this.props.track, this.props.property, this.props.default);
    return <EditableText key={this.props.track.id} onSave={this.onSave} value={val} />;
  }
});

export default TrackPropertyEditor;
