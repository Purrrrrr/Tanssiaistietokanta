import React from "react";
import createClass from "create-react-class";
import "./fullscreen.sass";

const Fullscreenable = createClass({
  getInitialState() {
    return {isFullscreen: false};
  },
  goFullscreen() {
    this.setState({isFullscreen: true});
  },
  componentWillMount(){
    document.addEventListener("keydown", this.keyPress, false);
  },
  componentWillUnmount() {
    document.removeEventListener("keydown", this.keyPress, false);
  },
  keyPress(e) {
    if (e.keyCode === 27) this.leaveFullscreen();
  },
  leaveFullscreen() {
    this.setState({isFullscreen: false});
  },
  render() {
    const button = <p><button onClick={this.goFullscreen}>Koko näytön tila</button></p>;
    return (<div onKeyPress={this.keyPress} className={this.state.isFullscreen ? 'fullscreen' : ''}>
      {this.state.isFullscreen ? null : button}
      {this.props.children}
    </div>);
  }
});
export default Fullscreenable;
