import { Button, ButtonProps } from '@/libraries/ui'

type ToolbarButtonProps = ButtonProps & (
  { tooltip: string, text?: never } | { text: string, tooltip?: string }
)

export function ToolbarButton({ tooltip, text, ...props }: ToolbarButtonProps) {
  return <Button
    minimal
    tooltip={tooltip}
    aria-label={tooltip}
    {...props}
    paddingClass={text ? undefined : ''}
    text={text}
    className={text
      ? ''
      : 'grid justify-center items-center align-sub size-7.5 text-[18px]'
    }
  />
}
