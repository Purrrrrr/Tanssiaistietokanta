import React from 'react';
import {TextArea as BlueprintTextArea} from "@blueprintjs/core";
import { asAccessibleField } from './FormField';


interface BasicTextAreaProps extends Omit<React.ComponentProps<typeof BlueprintTextArea>, "onChange"> {
  onChange: (value: string, event: React.ChangeEvent<HTMLTextAreaElement>) => any
}

export const BasicTextArea = React.forwardRef<BlueprintTextArea, BasicTextAreaProps>(
  function BasicTextArea({onChange, ...props}, ref) {
    return <BlueprintTextArea ref={ref} 
      onKeyDown={e => (e.key === 'Escape') && (e.target as HTMLTextAreaElement).blur()}
      onChange={e => onChange && onChange(e.target.value, e)}
      {...props}
    />;
  }
);

export const TextArea = asAccessibleField(BasicTextArea);
