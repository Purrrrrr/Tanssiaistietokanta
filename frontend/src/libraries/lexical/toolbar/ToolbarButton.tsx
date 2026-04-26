import { Button, ButtonProps } from 'libraries/ui'

export function ToolbarButton({ tooltip, ...props }: ButtonProps & { tooltip: string }) {
  return <Button
    minimal
    tooltip={tooltip}
    aria-label={tooltip}
    {...props}
    paddingClass=""
    className="grid justify-center items-center align-sub size-[30px] [font-size:18px]"
  />
}
