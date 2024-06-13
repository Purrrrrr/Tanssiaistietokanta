import React  from 'react'

import { Conflict, ConflictData, Deleted, FieldComponentDisplayProps, FieldComponentPropsWithoutEvent, NoRequiredProperties, PartialWhen, TypedStringPath, UserGivenFieldContainerProps } from './types'

import { FieldContainer, FieldContainerProps } from './FieldContainer'
import { useFormMetadata } from './formContext'
import { useFieldValueProps } from './hooks'
import {useError, ValidationProps} from './validation'

export type UntypedFieldProps<ValuePath, Value, Component extends React.ElementType, AdditionalProps> =
  {
    path: ValuePath
    component: Component & React.JSXElementConstructor<FieldComponentPropsWithoutEvent<Value> & AdditionalProps>
    renderConflictItem?: Value extends (infer I)[] ? (item: I) => (string | React.ReactNode) : never
  }
  & FieldDataHookProps
  & MaybeComponentProps<Omit<React.ComponentPropsWithoutRef<Component>, keyof FieldComponentPropsWithoutEvent<Value>>>

type MaybeComponentProps<Props extends object> = PartialWhen<NoRequiredProperties<Props>, { componentProps: Props }>

export type FieldProps<T, V, P extends FieldComponentPropsWithoutEvent<V>> = {
  path: TypedStringPath<V, T>
  component: React.JSXElementConstructor<P>
  renderConflictItem?: V extends (infer I)[] ? (item: I) => string : never
} & FieldDataHookProps & MaybeComponentProps<Omit<P, keyof FieldComponentPropsWithoutEvent<V>>>

export function Field<T, V, P extends FieldComponentPropsWithoutEvent<V>>(
  { path, component: Component, componentProps, renderConflictItem, ...rest }: FieldProps<T, V, P>
) {
  const dataProps = useFieldValueProps<T, V>(path)
  const { fieldProps, containerProps } = useFieldData(path, dataProps.value, rest)
  const allProps = {
    ...componentProps, ...fieldProps, ...dataProps
  } as P

  const conflictData = useFieldConflictData<T, V>(path, (conflict, type) => {
    const value = conflict[type]
    if (value === Deleted) return <div>DELETED</div>
    switch (conflict?.type) {
      case 'scalar':
        return type === 'local'
          ? <Component {...allProps} />
          : <Component {...allProps} readOnly value={conflict.server} />
      case 'array':
        return <ConflictListValue list={value as unknown[]} renderItem={renderConflictItem}/>
    }
    return null
  })

  return <FieldContainer {...containerProps} conflictData={conflictData}><Component {...allProps}  /></FieldContainer>
}

interface FieldDataHookProps extends UserGivenFieldContainerProps, ValidationProps {}

interface FieldData {
  fieldProps: FieldComponentDisplayProps
  containerProps: FieldContainerProps
}

export function useFieldData<Value>(
  path: string | number,
  value: Value,
  {label, labelInfo, helperText: _ignored, inline: maybeInline, labelStyle: maybeLabelStyle, ...rest}: FieldDataHookProps
) : FieldData {

  const ctx = useFormMetadata<unknown>()
  const inline = maybeInline ?? ctx.inline
  const labelStyle = maybeLabelStyle ?? ctx.labelStyle

  const id = String(path).replace(/\./g, '--')
  const errorId = `${id}--error`
  const error = useError(value, rest)

  const ariaProps = labelStyle === 'hidden' || labelStyle === 'hidden-nowrapper'
    ? {'aria-label': labelInfo ? `${label} ${labelInfo}` : label}
    : {}
  return {
    fieldProps: {
      id,
      inline,
      readOnly: ctx.readOnly,
      'aria-describedby': errorId,
      ...ariaProps
    },
    containerProps: {
      id,
      errorId,
      error,
      label,
      labelInfo,
      labelStyle,
      inline,
    },
  }
}

export function useFieldConflictData<T, V>(path: TypedStringPath<V, T>, renderItem: (c: Conflict<V>, t: 'local' | 'server') => React.ReactNode): ConflictData | undefined {
  const ctx = useFormMetadata<T>()
  const conflict = ctx.getConflictAt<V>(path)

  if (conflict === null || conflict === undefined) return undefined
  const localValue = renderItem(conflict, 'local')
  if (!localValue) return undefined
  return {
    localValue,
    serverValue: renderItem(conflict, 'server'),
    onResolve(version) { ctx.onResolveConflict(path, version) }
  }
}

function ConflictListValue<T>(
  { list, renderItem = String }: { list: T[], renderItem?: (item: T) => string }
) {
  return <ul>
    {list.map((item) => <li key={(item as {_id?: string | number })?._id ?? renderItem(item)}>{renderItem(item)}</li>)}
  </ul>
}
