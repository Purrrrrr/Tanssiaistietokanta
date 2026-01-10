import React from 'react'
import classNames from 'classnames'

import { ColorClass, CssClass } from './classes'

export interface FormGroupProps extends Omit<FormGroupPropsB, 'inline' | 'color'>, React.ComponentPropsWithoutRef<'div'> {
  elementRef?: React.Ref<HTMLDivElement>
  inline?: boolean
  labelStyle?: 'above' | 'beside'
  color?: 'danger'
}

export interface FormGroupPropsB {
  elementRef?: React.Ref<HTMLDivElement>
  className?: string
  color?: 'danger'
  children?: React.ReactNode

  /**
     * Optional helper text. The given content will be wrapped in
     * `Classes.FORM_HELPER_TEXT` and displayed beneath `children`.
     * Helper text color is determined by the `color`.
     */
  helperText?: React.ReactNode

  /** Whether to render the label and children on a single line. */
  inline?: boolean

  /** Label of this form group. */
  label: React.ReactNode

  /**
     * `id` attribute of the labelable form element that this `FormGroup` controls,
     * used as `<label for>` attribute.
     */
  labelFor?: string

  /**
     * Optional secondary text that appears after the label.
     */
  labelInfo?: React.ReactNode

  /**
     * Optional text for `label`. The given content will be wrapped in
     * `Classes.FORM_GROUP_SUB_LABEL` and displayed beneath `label`. The text color
     * is determined by the `color`.
     */
  subLabel?: React.ReactNode
}

export function FormGroup({ elementRef, className, inline = false, labelStyle: maybeLabelStyle, ...props }: FormGroupProps) {
  const labelStyle = maybeLabelStyle ?? (inline ? 'beside' : 'above')

  return <FG
    elementRef={elementRef}
    {...props}
    inline={inline || labelStyle === 'beside'}
    className={inline
      ? classNames(CssClass.formGroupInline, className)
      : classNames(labelStyle === 'beside' && CssClass.formGroupInlineFill, className)}
  />
}

const Classes = {
  FORM_GROUP: 'bp5-form-group',
  FORM_GROUP_SUB_LABEL: 'bp5-form-group-sub-label',
  FORM_CONTENT: 'bp5-form-content',
  FORM_HELPER_TEXT: 'bp5-form-helper-text',
  INLINE: 'bp5-inline',
  LABEL: 'bp5-label',
}

export function FG(props: FormGroupPropsB) {
  const { elementRef, children, helperText, label, labelFor, labelInfo, subLabel, className, inline, color, ...rest } = props
  const cn = classNames(
    Classes.FORM_GROUP,
    {
      'bp5-color-danger': color === 'danger',
      [Classes.INLINE]: inline,
    },
    className,
  )
  return (
    <div className={cn} {...rest} ref={elementRef}>
      <label className={Classes.LABEL} htmlFor={labelFor}>
        {label} <span className={ColorClass.textMuted}>{labelInfo}</span>
      </label>
      {subLabel && <div className={'mb-1' + Classes.FORM_GROUP_SUB_LABEL}>{subLabel}</div>}
      <div className={Classes.FORM_CONTENT}>
        {children}
        {helperText && <div className={'mt-1 ' + Classes.FORM_HELPER_TEXT}>{helperText}</div>}
      </div>
    </div>
  )
}
