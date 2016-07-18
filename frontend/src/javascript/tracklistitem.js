import React from "react";
import {noop} from "lodash";
import TrackEditor from "javascript/trackeditor";
import css from "sass/tracklist";

const TrackListItem = React.createClass({
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
      editing: false 
    };
  },
  toggleEditor() {
    const editing = !this.state.editing;
    this.setState({editing});
  },
  onSave(track) {
    this.setState({editing: false});
    this.props.onSave(track);
  },
  render() {
    var editor;
    if (this.state.editing) {
      editor = <TrackEditor track={this.props.track} onSave={this.onSave} />;
    }
    return (<div className={css.track}>
        <div onClick={this.toggleEditor}> 
          <strong>{this.props.track.name}</strong> ({this.props.track.fileName})
        </div>
        {editor}
      </div>
    );
  }
});
export default TrackListItem;
