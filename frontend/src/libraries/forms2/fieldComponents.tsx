import React, {useRef, useState, ComponentProps} from 'react';
import {Icon} from "../ui";
import {Classes, Switch as BlueprintSwitch, TextArea as BlueprintTextArea, TextAreaProps as BlueprintTextAreaProps} from "@blueprintjs/core";
import classNames from 'classnames';
import {Field, FieldProps} from "./Field";
import {FieldComponentProps, TypedPath, PropertyAtPath} from './types'
import {ClosableEditor} from './ClosableEditor'

type AdditionalPropsFrom<Props> = Omit<Props, keyof FieldComponentProps<any>>

export type SwitchFieldProps<L, P, V> = Omit<FieldProps<L, P, V, typeof Switch, {label: string, inline?: boolean}>, "componentProps" | "component" | "labelStyle">

export function SwitchField<T, L, P extends TypedPath<T,P, boolean>, V extends PropertyAtPath<T,P> & boolean>(
  {label, inline, ...props} : SwitchFieldProps<L, P, V>
) {
  return <Field<T,L,P,V, typeof Switch, ExtraSwitchProps> {...props} label={label} labelStyle="hidden" component={Switch as any} componentProps={{label, inline}} />
}

interface SwitchProps extends FieldComponentProps<boolean, HTMLInputElement>, ExtraSwitchProps { }
interface ExtraSwitchProps {
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

export type InputFieldProps<L, P, V>  = Omit<FieldProps<L, P, V, typeof Input, {}>, "component">
export function InputField<T, L, P extends TypedPath<T,P, string | undefined>, V extends PropertyAtPath<T,P> & string >(
  props : InputFieldProps<L, P, V> 
) {
  return <Field<T,L,P,V,typeof Input, AdditionalPropsFrom<ComponentProps<"input">>> {...props} component={Input as any} />
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

export interface ClickToEditProps extends FieldComponentProps<string, HTMLInputElement>, AdditionalPropsFrom<ComponentProps<"input">> {
  valueFormatter?: (value: string) => React.ReactNode
  inline?: boolean
}
export function ClickToEdit({value, readOnly, valueFormatter, onBlur, className, onChange, inline, hasConflict, ...props} : ClickToEditProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isOpen, setOpen] = useState(false)

  return <ClosableEditor
    open={isOpen}
    onOpen={() => {
      setOpen(true);
      setTimeout(() => inputRef.current?.focus?.(), 10) 
    }}
    className={className}
    inline={inline}
    readOnly={readOnly}
    aria-describedby={props['aria-describedby']} 
    aria-label={props['aria-label']} 
    closedValue={valueFormatter ? valueFormatter(value ?? "") : value}
  >
    <Input
      style={isOpen ? {} : {display: 'none'}}
      {...props}
      value={value}
      onChange={onChange}
      inline={inline}
      hasConflict={hasConflict}
      ref={inputRef}
      onBlur={(e) => { console.log(e); setOpen(false); onBlur && onBlur(e)}}
    />
  </ClosableEditor>
}

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
