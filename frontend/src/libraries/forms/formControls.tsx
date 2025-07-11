import React from 'react'

import {StringPathToList} from './types'

import {Button} from 'libraries/ui'

import {useFormIsValid, useFormMetadata} from './formContext'
import {useRemoveFromList} from './hooks'

type ButtonProps = React.ComponentProps<typeof Button>;

export function SubmitButton({disabled, ...props} : ButtonProps) {
  const formIsValid = useFormIsValid()
  const {readOnly} = useFormMetadata()
  if (readOnly) return null
  return <ActionButton type="submit" color="primary"
    disabled={!formIsValid || disabled} {...props} />
}

export interface RemoveItemButtonProps<T> extends ButtonProps {
  path: StringPathToList<T>
  index: number
}

export function RemoveItemButton<T>({path, index, onClick, ...props}: RemoveItemButtonProps<T>) {
  const onRemove = useRemoveFromList<T>(path, index)
  return <ActionButton onClick={(e) => { onRemove(); if (onClick) onClick(e) } } color="danger" {...props} />
}

export function ActionButton(props : ButtonProps) {
  return <FormControl><Button {...props} /></FormControl>
}
export function FormControl({children}) {
  const {readOnly} = useFormMetadata()
  if (readOnly) return null

  return children
}
export function asFormControl<T extends JSX.IntrinsicAttributes>(Component: React.ComponentType<T>) {
  return (props: T) => <FormControl><Component {...props} /></FormControl>
}
