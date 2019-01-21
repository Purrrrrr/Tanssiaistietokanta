import React from "react";
import css from "sass/danceList";
import Fullscreenable from "javascript/widgets/fullscreenable";
import _ from "lodash";

const DanceList = React.createClass({
  renderPart({name, tracks}) {
    const sorted = _.clone(tracks);
    sorted.sort();
    return (<div>
        <h2>{name}</h2>
      {sorted.map((track) => <p>{track.name}</p>)}
    </div>);
  },
  render() {
    return (<Fullscreenable><div className={this.props.sidebyside ? css.sidebysideList : css.danceList}>
      {this.props.playlist.map(this.renderPart)}
    </div></Fullscreenable>);
  }
});
export default DanceList;
