import React from 'react';
import classNames from 'classnames';
import { asAccessibleField } from './FormField';
import {Classes} from "@blueprintjs/core";

interface BasicInputProps extends Omit<React.ComponentProps<"input">, "onChange"> {
  onChange?: (value: any, event: React.ChangeEvent<HTMLInputElement>) => any
  fill?: boolean
}

export const BasicInput = React.forwardRef<HTMLInputElement, BasicInputProps>(
  function BasicInput({className, onChange, ...props}, ref) {
    return <input ref={ref} className={classNames(className, Classes.INPUT, Classes.FILL)}
      onKeyDown={e => (e.key === 'Escape' || e.key === 'Enter') && (e.target as HTMLInputElement).blur()}
      onChange={onChange ? e => onChange(e.target.value, e) : undefined}
      {...props}
    />;
  }
);

export const Input = asAccessibleField(BasicInput);
