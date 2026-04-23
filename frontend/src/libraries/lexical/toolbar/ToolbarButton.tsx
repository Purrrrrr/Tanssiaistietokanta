import { Button, ButtonProps } from 'libraries/ui'

export function ToolbarButton({ ...props }: ButtonProps) {
  return <Button minimal {...props} paddingClass="" className="grid justify-center items-center align-sub size-[30px] [font-size:18px]" />
}
