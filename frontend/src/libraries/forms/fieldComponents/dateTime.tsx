import { format } from 'date-fns'

import {Conflict, Deleted, FieldComponentProps, FieldPropsWithoutComponent, Version} from '../types'

import { DateInput, DateRangeInput } from 'libraries/formsV2/components/inputs'
import DateTimeInput from 'libraries/formsV2/components/inputs/DateTimeInput'

import {Field, useFieldConflictData, useFieldData} from '../Field'
import {FieldContainer} from '../FieldContainer'
import { useFormStrings } from '../formContext'
import { useFieldValueProps } from '../hooks'

import './dateTime.css'

export const dateFormat = 'dd.MM.yyyy'
export const dateTimeFormat = 'dd.MM.yyyy HH:mm'

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
  const Input = showTime ? DateTimeInput : DateInput

  return <Input
    readOnly={readOnly}
    id={id}
    value={value ?? null}
    onChange={(value: Date |null) => {
      if (!value) {
        onChange('')
      } else if (showTime && value) {
        onChange(toISOString(value, true))
      } else {
        onChange(toISOString(value) ?? '')
      }
    }}
    minDate={toDate(minDate) ?? defaultMin}
    maxDate={toDate(maxDate) ?? defaultMax}
    {...props}
  />
}

export interface DateRangeFieldProps<T> extends Omit<FieldPropsWithoutComponent<T, string>, 'path'> {
  id: string
  minDate?: string | Date | undefined
  maxDate?: string | Date | undefined
  beginPath: FieldPropsWithoutComponent<T, string>['path']
  endPath: FieldPropsWithoutComponent<T, string>['path']
}

export function DateRangeField<T>(
  {
    id,
    beginPath, endPath,
    minDate, maxDate,
    ...styleProps
  }: DateRangeFieldProps<T>
) {
  const beginDataProps = useFieldValueProps<T, string>(beginPath)
  const endDataProps = useFieldValueProps<T, string>(endPath)
  // const { containerProps } = useFieldData(id, null, styleProps)
  const { fieldProps: beginFieldProps, containerProps: beginContainerProps } = useFieldData(beginPath, beginDataProps.value, styleProps)
  const { fieldProps: endFieldProps, containerProps: endContainerProps } = useFieldData(endPath, endDataProps.value, styleProps)
  const errors = [
    ...(beginContainerProps.error?.errors ?? []),
    ...(endContainerProps.error?.errors ?? []),
  ]
  const containerProps = {
    ...beginContainerProps,
    error: errors.length ? { errors } : null
  }

  const beginDate = toDate(beginDataProps.value) ?? null
  const endDate = toDate(endDataProps.value) ?? null
  const conflictData = useCombinedConflictData(beginPath, beginDate, endPath, endDate)

  return <FieldContainer {...containerProps} conflictData={conflictData}>
    <DateRangeInput
      readOnly={beginFieldProps.readOnly || endFieldProps.readOnly}
      id={id}
      value={[beginDate, endDate]}
      onChange={([start, end]) => {
        beginDataProps.onChange(toISOString(start))
        endDataProps.onChange(toISOString(end))
      }}
      minDate={toDate(minDate) ?? defaultMin}
      maxDate={toDate(maxDate) ?? defaultMax}
    />
  </FieldContainer>
}

function useCombinedConflictData<T>(
  beginPath: FieldPropsWithoutComponent<T, string>['path'],
  beginDate: Date | null,
  endPath: FieldPropsWithoutComponent<T, string>['path'],
  endDate: Date | null,
) {
  const extractValue = (conflict: Conflict<string>, type: 'local' | 'server') => {
    const value = conflict[type]
    return value === Deleted ? null : value
  }
  const strings = useFormStrings().dateTime
  const beginConflictData = useFieldConflictData<T, string>(beginPath, extractValue)
  const endConflictData = useFieldConflictData<T, string>(endPath, extractValue)

  const fmt = (date: Date | null) => date ? format(date, strings.dateFormat) : ''
  const renderRange = (start: Date | null, end: Date | null) =>
    <p>{`${fmt(start)} - ${fmt(end)}`}</p>
  return (beginConflictData || endConflictData)
    ? {
      localValue: renderRange(toDate(beginConflictData?.localValue as string | null) ?? beginDate, endConflictData?.localValue as Date | null ?? endDate),
      serverValue: renderRange(toDate(beginConflictData?.serverValue as string | null) ?? beginDate, endConflictData?.serverValue as Date | null ?? endDate),
      onResolve(version: Version) {
        beginConflictData?.onResolve(version)
        endConflictData?.onResolve(version)
      }
    }
    : undefined
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
    ? format(value, 'yyyy-MM-dd\'T\'HH:mm:ss.SSS')
    : format(value, 'yyyy-MM-dd')
}
