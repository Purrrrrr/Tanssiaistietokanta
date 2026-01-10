import React from 'react'
import classNames from 'classnames'

import { Color } from './types'

import { CssClass } from './classes'

export interface FormGroupProps extends Omit<FormGroupPropsB, 'inline' | 'intent'>, React.ComponentPropsWithoutRef<'div'> {
  elementRef?: React.Ref<HTMLDivElement>
  inline?: boolean
  labelStyle?: 'above' | 'beside'
  color?: Color
}

export interface FormGroupPropsB {
  elementRef?: React.Ref<HTMLDivElement>
  className?: string
  intent?: Color
  children?: React.ReactNode
  /**
     * A space-delimited list of class names to pass along to the
     * `Classes.FORM_CONTENT` element that contains `children`.
     */
  contentClassName?: string

  /**
     * Whether form group should appear as non-interactive.
     * Remember that `input` elements must be disabled separately.
     */
  disabled?: boolean

  /**
     * Whether the component should take up the full width of its container.
     */
  fill?: boolean

  /**
     * Optional helper text. The given content will be wrapped in
     * `Classes.FORM_HELPER_TEXT` and displayed beneath `children`.
     * Helper text color is determined by the `intent`.
     */
  helperText?: React.ReactNode

  /** Whether to render the label and children on a single line. */
  inline?: boolean

  /** Label of this form group. */
  label?: React.ReactNode

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
     * is determined by the `intent`.
     */
  subLabel?: React.ReactNode
}

export function FormGroup({ elementRef, className, inline, labelStyle: maybeLabelStyle, ...props }: FormGroupProps) {
  const labelStyle = maybeLabelStyle ?? (inline ? 'beside' : 'above')
  const inlineLabel = labelStyle === 'beside'
  const inlineProps = inline
    ? { inline: true, className: classNames(CssClass.formGroupInline, className) }
    : { inline: inlineLabel, className: classNames(inlineLabel && CssClass.formGroupInlineFill, className) }

  const {
    color, children, disabled, contentClassName, helperText, label, labelFor, labelInfo, style, subLabel,
    ...rest
  } = props
  const props2 = {
    intent: color, children, disabled, contentClassName, helperText, label, labelFor, labelInfo, style, subLabel,
    ...inlineProps,
  }

  return <FG {...props2} elementRef={elementRef} {...rest} />
}

const Classes = {
  FORM_GROUP: 'bp5-form-group',
  FORM_GROUP_SUB_LABEL: 'bp5-form-group-sub-label',
  FORM_CONTENT: 'bp5-form-content',
  FORM_HELPER_TEXT: 'bp5-form-helper-text',
  DISABLED: 'bp5-disabled',
  FILL: 'bp5-fill',
  INLINE: 'bp5-inline',
  LABEL: 'bp5-label',
  TEXT_MUTED: 'bp5-text-muted',
  intentClass: (intent?: Color) => (intent ? `bp5-intent-${intent.toLowerCase()}` : ''),
}

export function FG(props: FormGroupPropsB) {
  const { elementRef, children, contentClassName, helperText, label, labelFor, labelInfo, subLabel, className, disabled, fill, inline, intent, ...rest } = props
  const cn = classNames(
    Classes.FORM_GROUP,
    Classes.intentClass(intent),
    {
      [Classes.DISABLED]: disabled,
      [Classes.FILL]: fill,
      [Classes.INLINE]: inline,
    },
    className,
  )
  return (
    <div className={cn} {...rest} ref={elementRef}>
      {label && (
        <label className={Classes.LABEL} htmlFor={labelFor}>
          {label} <span className={Classes.TEXT_MUTED}>{labelInfo}</span>
        </label>
      )}
      {subLabel && <div className={Classes.FORM_GROUP_SUB_LABEL}>{subLabel}</div>}
      <div className={classNames(Classes.FORM_CONTENT, contentClassName)}>
        {children}
        {helperText && <div className={Classes.FORM_HELPER_TEXT}>{helperText}</div>}
      </div>
    </div>
  )
}
