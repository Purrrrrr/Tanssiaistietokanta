import React from "react";
import noop from "lodash";

const EditableText = React.createClass({
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
      inputValue: this.props.value || "",
      editing: false
    };
  },
  edit() {
    this.setState({editing: true});
  },
  modified(event) {
    const inputValue = event.target.value;
    this.setState({inputValue});
  },
  save(e) {
    e.preventDefault();
    this.props.onSave(this.state.inputValue);
    this.setState({editing: false});
  },
  render() {
    if (this.state.editing) {
      return <span><form onSubmit={this.save}><input ref={input => {if (input) input.focus();}} value={this.state.inputValue} onChange={this.modified} onBlur={this.save} /></form></span>;
    } else {
      return <span onClick={this.edit}>{this.props.value}</span>;
    }
  }
});
export default EditableText;
