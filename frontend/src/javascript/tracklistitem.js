import React from "react";
import {noop} from "lodash";
import css from "sass/tracklist";
import TrackPropertyEditor from "javascript/widgets/trackPropertyEditor";

const TrackListItem = React.createClass({
  propTypes: {
    onSave: React.PropTypes.func
  },
  getDefaultProps() {
    return {
      onSave: noop
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
    return (<div className={css.track}>
        <div> 
          <div> 
            <strong><TrackPropertyEditor property="name" {...editorProps} multiline={false} /></strong>
            {" "}({track.fileName})
          </div>
          <div className={css.info}>
            <label>Alkusoitto: </label>
            <TrackPropertyEditor property="info.prelude" {...editorProps} />
          </div>
          <div className={css.info}>
            <label>Lyhyt kuvaus: </label>
            <TrackPropertyEditor property="info.description" {...editorProps} />
          </div>
          <div className={css.info}>
            <label>Tanssikuvio:</label>
            <TrackPropertyEditor property="info.formation" {...editorProps} />
          </div>
          <div className={css.info}>
            <label>Huomautukset:</label>
            <TrackPropertyEditor property="info.remarks" {...editorProps} />
          </div>
          <div className={css.info}>
            <label>Opetettu setissä:{" "}</label>
            <TrackPropertyEditor property="info.teachingSet" {...editorProps} />
          </div>
        </div>
      </div>
    );
  }
});
export default TrackListItem;
