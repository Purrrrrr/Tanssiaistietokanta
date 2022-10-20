import React from 'react'
import {Button} from 'libraries/ui'
import {useFormIsValid, useFormMetadata} from './formContext'

type ButtonProps = React.ComponentProps<typeof Button>;

export function SubmitButton({disabled, ...props} : ButtonProps) {
  const formIsValid = useFormIsValid()
  const {readOnly} = useFormMetadata()
  if (readOnly) return null
  return <ActionButton type="submit" intent="primary"
    disabled={!formIsValid || disabled} {...props} />
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
