import { Button, ButtonProps } from './Button'

export function ModeSelector({ children }: { children: React.ReactNode }) {
  return <div className="inline-block p-0.5 bg-gray-200 rounded-lg shadow-xs shadow-stone-400/40">
    {children}
  </div>
}

interface ModeButtonProps extends Omit<ButtonProps, 'minimal' | 'active'> {
  selected?: boolean
}

export function ModeButton({ selected, ...props }: ModeButtonProps) {
  return <Button {...props} minimal={!selected} paddingClass="py-[3px] px-2" className="rounded-md!" />
}
