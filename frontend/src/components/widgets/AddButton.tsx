import { Button, ButtonProps } from 'libraries/ui'
import { Add } from 'libraries/ui/icons'

export function AddButton(props: ButtonProps) {
  return <Button icon={<Add />} {...props} />
}
