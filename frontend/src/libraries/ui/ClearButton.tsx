import { Button, type ButtonProps } from './Button'
import { Cross } from './icons'

export function ClearButton(props: ButtonProps) {
  return <Button minimal icon={<Cross className="text-gray-600" />} {...props} />
}
