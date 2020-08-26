import {TextArea} from "@blueprintjs/core";
import React from 'react';


interface BasicTextAreaProps extends Omit<React.ComponentProps<typeof TextArea>, "onChange"> {
  onChange: (value: string, event: React.ChangeEvent<HTMLTextAreaElement>) => any
}

export const BasicTextArea = React.forwardRef<TextArea, BasicTextAreaProps>(
  function BasicTextArea({onChange, ...props}, ref) {
    return <TextArea ref={ref} 
      onKeyDown={e => (e.key === 'Escape') && (e.target as HTMLTextAreaElement).blur()}
      onChange={e => onChange && onChange(e.target.value, e)}
      {...props}
    />;
  }
);
