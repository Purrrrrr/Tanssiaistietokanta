import { Button, ButtonProps } from '@/libraries/ui'

type ToolbarButtonProps = Omit<ButtonProps, 'text'> & (
  { tooltip: string, text?: never } | { text: string, tooltip?: string }
)

export function ToolbarButton({ tooltip, text, ...props }: ToolbarButtonProps) {
  return <Button
    minimal
    tooltip={tooltip}
    iconOnly={!!tooltip}
    {...props}
    paddingClass={text ? undefined : ''}
    text={text ?? tooltip}
    className={text
      ? ''
      : 'grid justify-center items-center align-sub size-7.5 text-[18px]'
    }
  />
}
