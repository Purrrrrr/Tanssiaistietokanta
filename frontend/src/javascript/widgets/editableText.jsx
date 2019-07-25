import React from "react";
import createClass from "create-react-class";
import "./editableText.sass";

const EditableText = createClass({
  propTypes: {
    //onSave: React.PropTypes.func
  },
  getDefaultProps() {
    return {
      onSave: () => {}
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
      const inputProps = {
        className: "editableText",
        ref: input => {if (input) input.focus();},
        value: this.state.inputValue,
        onChange: this.modified,
        onBlur: this.save
      };
      const input = this.props.multiline ? <textarea {...inputProps} /> : <input {...inputProps} />;
      return <span><form onSubmit={this.save}>{input}</form></span>;
    } else {
      const val = this.props.value || <span className="addEntry">{this.props.addText || "Muokkaa"}</span>;
      return <span onClick={this.edit}>{val}</span>;
    }
  }
});
export default EditableText;
