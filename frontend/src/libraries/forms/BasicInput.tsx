import React from 'react';
import classNames from 'classnames';
import {Classes} from "@blueprintjs/core";

interface BasicInputProps extends Omit<React.ComponentProps<"input">, "onChange"> {
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => any
}

export const BasicInput = React.forwardRef<HTMLInputElement, BasicInputProps>(
  function BasicInput({className, onChange, ...props}, ref) {
    return <input ref={ref} className={classNames(className, Classes.INPUT)}
      onKeyDown={e => (e.key === 'Escape' || e.key === 'Enter') && (e.target as HTMLInputElement).blur()}
      onChange={onChange ? e => onChange(e.target.value, e) : undefined}
      {...props}
    />;
  }
);
