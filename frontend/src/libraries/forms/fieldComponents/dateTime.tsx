import React from 'react'
import {DateInput3, DateRangeInput3} from '@blueprintjs/datetime2'
import { format, parse } from 'date-fns'

import {Field, useFieldConflictData, useFieldData} from '../Field'
import {FieldContainer} from '../FieldContainer'
import { useFormStrings } from '../formContext'
import { useFieldValueProps } from '../hooks'
import {Conflict, Deleted, FieldComponentProps, FieldPropsWithoutComponent} from '../types'

import './dateTime.css'

export const dateFormat = 'dd.MM.yyyy'
export const dateTimeFormat = 'dd.MM.yyyy HH:mm'

const referenceDate = new Date('2000-01-01T00:00:00.000')

const defaultMax = new Date('2100-01-01')
const defaultMin = new Date('1950-01-01')

export interface DateFieldProps<T> extends FieldPropsWithoutComponent<T, string>, Omit<DateFieldInputProps, keyof FieldComponentProps<T>> {
}
export function DateField<T>({showTime, minDate, maxDate, ...props} : DateFieldProps<T>) {
  return <Field<T, string, DateFieldInputProps> {...props} component={DateFieldInput} componentProps={{showTime, minDate, maxDate}}/>
}

export interface DateFieldInputProps extends FieldComponentProps<string, HTMLInputElement> {
  showTime?: boolean
  minDate?: string | Date | undefined
  maxDate?: string | Date | undefined
}
export function DateFieldInput({value, onChange, inline: _ignored, readOnly, id, showTime, minDate, maxDate, ...props} : DateFieldInputProps) {
  return <DateInput3
    {...useCommonProps(showTime)}
    disabled={readOnly}
    inputProps={{
      id,
    }}
    minDate={toDate(minDate) ?? defaultMin}
    maxDate={toDate(maxDate) ?? defaultMax}
    timePrecision={showTime ? 'minute' : undefined}
    value={value || null}
    canClearSelection={false}
    onChange={value => onChange(value ?? '')}
    {...props}
  />
}

export interface DateRangeFieldProps<T> extends Omit<FieldPropsWithoutComponent<T, string>, 'path'> {
  id: string
  showTime?: boolean
  allowSingleDayRange?: boolean
  minDate?: string | Date | undefined
  maxDate?: string | Date | undefined
  beginPath: FieldPropsWithoutComponent<T, string>['path']
  beginLabel: string
  endPath: FieldPropsWithoutComponent<T, string>['path']
  endLabel: string
}

export function DateRangeField<T>(
  {
    id,
    beginPath, beginLabel,
    endPath, endLabel,
    label, labelStyle, labelInfo, inline, helperText,
    allowSingleDayRange = true, showTime, minDate, maxDate,
    ...rest
  }: DateRangeFieldProps<T>
) {
  const beginDataProps = useFieldValueProps<T, string>(beginPath)
  const endDataProps = useFieldValueProps<T, string>(endPath)
  const { containerProps } = useFieldData(id, null, {label, labelStyle, labelInfo, inline, helperText})
  const subLabelStyle = containerProps.labelStyle.startsWith('hidden') || inline ?
    'hidden' :
    containerProps.labelStyle === 'beside' ? 'above' : 'beside'
  const { fieldProps: beginFieldProps, containerProps: beginContainerProps } = useFieldData(beginPath, beginDataProps.value, {label: beginLabel, labelStyle: subLabelStyle, inline, ...rest })
  const { fieldProps: endFieldProps, containerProps: endContainerProps } = useFieldData(endPath, endDataProps.value, {label: endLabel, labelStyle: subLabelStyle, inline, ...rest })

  const renderConflictItem = (onChangeLocal) => (conflict: Conflict<string>, type: 'server' | 'local') => {
    const value = conflict[type]
    const onChange = type === 'local'
      ? onChangeLocal
      : () => {/* no-op */}
    return <DateFieldInput
      id={id+'-'+type}
      readOnly={type === 'server'}
      value={value === Deleted ? '' : value}
      onChange={onChange}
    />
  }

  const beginConflictData = useFieldConflictData<T, string>(beginPath, renderConflictItem(beginDataProps.onChange))
  const endConflictData = useFieldConflictData<T, string>(endPath, renderConflictItem(endDataProps.onChange))

  //Complete hack to allow adding all the labels to the DOM correctly
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const containerComponent = React.forwardRef<HTMLDivElement, any>(
    ({children, ...props}, ref) => {
      return <div ref={ref} {...props} className={`dateRangeInputContainer ${containerProps.inline ? 'dateRangeInputContainer-inline' : 'dateRangeInputContainer-block'} ${props.className}`}>
        <FieldContainer {...containerProps}>
          <FieldContainer {...beginContainerProps} conflictData={beginConflictData}>
            {children?.[0]}
          </FieldContainer>
          {' '}
          <FieldContainer {...endContainerProps} conflictData={endConflictData}>
            {children?.[1]}
          </FieldContainer>
        </FieldContainer>
      </div>
    }
  )

  return <DateRangeInput3
    {...useCommonProps(showTime)}
    disabled={beginFieldProps.readOnly || endFieldProps.readOnly}
    allowSingleDayRange={allowSingleDayRange}
    shortcuts={false}
    startInputProps={{
      ...beginFieldProps,
      className: 'bp5-fill',
    }}
    endInputProps={{
      ...endFieldProps,
      className: 'bp5-fill',
    }}
    popoverProps={{
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      targetTagName: containerComponent as any
    }}
    minDate={toDate(minDate) ?? defaultMin}
    maxDate={toDate(maxDate) ?? defaultMax}
    timePrecision={showTime ? 'minute' : undefined}
    value={[toDate(beginDataProps.value) ?? null, toDate(endDataProps.value) ?? null]}
    onChange={([start, end]) => {
      beginDataProps.onChange(toISOString(start, showTime))
      endDataProps.onChange(toISOString(end, showTime))

    }}
  />
}

function toDate(value: string | null | Date | undefined): Date | undefined | null {
  if (typeof value === 'string') {
    const parsed = new Date(value)
    return isNaN(+parsed) ? undefined : parsed
  }
  return value
}

function toISOString(value: Date | null, showTime?: boolean): string {
  if (value === null) return ''
  return showTime
    ? format(value, 'yyyy-MM-dd\'T\'HH:mm:ss')
    : format(value, 'yyyy-MM-dd')
}

function useCommonProps(showTime?: boolean) {
  const strings = useFormStrings().dateTime
  const valueFormat = showTime ? strings.dateTimeFormat : strings.dateFormat


  return {
    locale: 'fi',
    formatDate: date => format(date, valueFormat),
    parseDate: date => parse(date, valueFormat, referenceDate),
  }
}
