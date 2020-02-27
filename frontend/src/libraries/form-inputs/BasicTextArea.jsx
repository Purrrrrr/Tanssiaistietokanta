import {TextArea} from "@blueprintjs/core";
import React from 'react';

export const BasicTextArea = React.forwardRef(
  function BasicTextArea({onChange, ...props}, ref) {
    return <TextArea ref={ref} 
      onKeyDown={e => (e.key === 'Escape') && e.target.blur()}
      onChange={e => onChange(e.target.value, e)}
      {...props}
    />;
  }
);
