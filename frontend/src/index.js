import PlaylistApp from "javascript/playlistapp";
import React from "react";
import ReactDOM from "react-dom";

const container = document.createElement('div');
container.className ="biisitin";
document.body.appendChild(container);

ReactDOM.render(<PlaylistApp/>, container);
