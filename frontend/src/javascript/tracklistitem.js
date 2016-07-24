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
    const track = this.props.track;
    const info = track.info;
    return (<div className={css.track}>
        <div onClick={this.toggleEditor}> 
          <strong>{track.name}</strong> ({track.fileName})
          <div>
            Alkusoitto: {info.prelude || "?"}&nbsp;
            Lyhyt kuvaus: {info.description || "?"}&nbsp;
            Tanssikuvio: {info.formation || "?"}&nbsp;
            Huomautukset: {info.remarks || "?"}&nbsp;
          </div>
        </div>
        {editor}
      </div>
    );
  }
});
export default TrackListItem;
