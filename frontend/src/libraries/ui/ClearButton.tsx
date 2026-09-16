import { Button, type ButtonProps } from './Button'
import { Icon } from './Icon'

export function ClearButton(props: ButtonProps) {
  return <Button minimal icon={<Icon icon="cross" className="text-gray-600" />} {...props} />
}
