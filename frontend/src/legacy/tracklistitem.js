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
            {" "}
          </div>
          <div className="info">
            <label>Alkusoitto: </label>
            <TrackPropertyEditor property="prelude" {...editorProps} />
          </div>
          <div className="info">
            <label>Lyhyt kuvaus: </label>
            <TrackPropertyEditor property="description" {...editorProps} />
          </div>
          <div className="info">
            <label>Tanssikuvio:</label>
            <TrackPropertyEditor property="formation" {...editorProps} />
          </div>
          <div className="info">
            <label>Huomautukset:</label>
            <TrackPropertyEditor property="remarks" {...editorProps} />
          </div>
          <div className="info">
            <label>Opetettu setissä:{" "}</label>
            <TrackPropertyEditor property="teachingSet" {...editorProps} />
          </div>
        </div>
      </div>
    );
  }
});
export default TrackListItem;
