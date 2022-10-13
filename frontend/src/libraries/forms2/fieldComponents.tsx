import React, {ComponentProps} from 'react';
import {Classes, Switch as BlueprintSwitch, TextArea as BlueprintTextArea, TextAreaProps as BlueprintTextAreaProps} from "@blueprintjs/core";
import classNames from 'classnames';
import {fieldFor, FieldProps} from "./Field";
import {FieldComponentProps, Path, PropertyAtPath} from './types'

type AdditionalPropsFrom<Props> = Omit<Props, keyof FieldComponentProps<any>>

export function switchFor<T>() {
  const Field = fieldFor<T>()
  return function SwitchField<L extends string, P extends PropertyAtPath<T,P> extends boolean ?  Path<T> : never, V extends PropertyAtPath<T,P> & boolean>(
    {label, inline, ...props} : Omit<FieldProps<L, P, V, typeof Switch, {label: string, inline?: boolean}>, "componentProps" | "component" | "labelStyle">
  ) {
    return <Field {...props} label={label} labelStyle="hidden" component={Switch as any} componentProps={{label, inline}} />
  }
}

interface SwitchProps extends FieldComponentProps<boolean, HTMLInputElement> {
  label: string
  inline?: boolean
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  function Switch({ value, onChange, readOnly, hasConflict, ...props }, ref) {
    return <BlueprintSwitch
      inputRef={ref}
      checked={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked, e)}
      disabled={readOnly}
      {...props}
    />
  }
)

export function inputFor<T>() {
  const Field = fieldFor<T>()
  return function InputField<L extends string, P extends PropertyAtPath<T,P> extends string | undefined ?  Path<T> : never, V extends PropertyAtPath<T,P> & (string | undefined) >(
    props : Omit<FieldProps<L, P, V, typeof Input, {}>, "component">
  ) {
    return <Field {...props} component={Input} />
  }
}

export interface InputProps extends FieldComponentProps<string, HTMLInputElement>, AdditionalPropsFrom<ComponentProps<"input">> {
  inline?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({value, className, onChange, inline, hasConflict, ...props}, ref) {
    return <input
      ref={ref}
      value={value ?? ""}
      className={classNames(className, Classes.INPUT, inline || Classes.FILL, hasConflict && Classes.INTENT_DANGER)}
      onKeyDown={e => (e.key === 'Escape' || e.key === 'Enter') && (e.target as HTMLInputElement).blur()}
      onChange={e => onChange(e.target.value, e)}
      {...props}
    />;
  }
);

interface TextAreaProps extends FieldComponentProps<string, HTMLTextAreaElement>, Pick<BlueprintTextAreaProps, "growVertically"> { }

export const TextArea = React.forwardRef<BlueprintTextArea, TextAreaProps>(
  function TextArea({value, onChange, hasConflict, ...props}, ref) {
    return <BlueprintTextArea
      ref={ref} 
      value={value ?? ""}
      fill
      intent={hasConflict ? "danger" : undefined}
      onKeyDown={e => (e.key === 'Escape') && (e.target as HTMLTextAreaElement).blur()}
      onChange={e => onChange && onChange(e.target.value, e)}
      {...props}
    />;
  }
);

interface V {name: string, b: boolean, a: {b: boolean}, u?: string}
const F = fieldFor<V>()
const I = inputFor<V>()
const S = switchFor<V>()
export const f = <I path={['name']} label="aa" />
export const f2 = <S path={['a', 'b']} label="aa" />
export const f3 = <F path={['name']} component={TextArea} label="aa" componentProps={{growVertically: true}} />
export const f4 = <F path={['u']} component={Input} label="aa" />
export const f5 = <F path={['b']} component={Switch} label="aa" componentProps={{label: "a"}} />
