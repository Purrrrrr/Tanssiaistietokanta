import React from 'react';
import classNames from 'classnames';
import {Classes} from "@blueprintjs/core";

export const BasicInput = React.forwardRef(
  function BasicInput({className, onChange, ...props}, ref) {
    return <input ref={ref} className={classNames(className, Classes.INPUT)}
      onKeyDown={e => (e.key === 'Escape' || e.key === 'Enter') && e.target.blur()}
      onChange={e => onChange(e.target.value, e)}
      {...props}
    />;
  }
);
