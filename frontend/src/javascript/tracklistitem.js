import React from "react";
import createClass from "create-react-class";
import "./tracklist.sass";
import TrackPropertyEditor from "./widgets/trackPropertyEditor";

const TrackListItem = createClass({
  propTypes: {
    //onSave: React.PropTypes.func
  },
  getDefaultProps() {
    return {
      onSave: () => {}
    };
  },
  onSave(track) {
    this.setState({editing: false});
    this.props.onSave(track);
  },
  render() {
    const track = this.props.track;
    const editorProps = {
      multiline: true,
      addText: "muokkaa",
      onSave: this.props.onSave,
      track
    };
    return (<div className="track">
        <div>
          <div>
            <strong><TrackPropertyEditor property="name" {...editorProps} multiline={false} /></strong>
            {" "}({track.fileName})
          </div>
          <div className="info">
            <label>Alkusoitto: </label>
            <TrackPropertyEditor property="info.prelude" {...editorProps} />
          </div>
          <div className="info">
            <label>Lyhyt kuvaus: </label>
            <TrackPropertyEditor property="info.description" {...editorProps} />
          </div>
          <div className="info">
            <label>Tanssikuvio:</label>
            <TrackPropertyEditor property="info.formation" {...editorProps} />
          </div>
          <div className="info">
            <label>Huomautukset:</label>
            <TrackPropertyEditor property="info.remarks" {...editorProps} />
          </div>
          <div className="info">
            <label>Opetettu setissä:{" "}</label>
            <TrackPropertyEditor property="info.teachingSet" {...editorProps} />
          </div>
        </div>
      </div>
    );
  }
});
export default TrackListItem;
