import { Button, ButtonProps } from './Button'

// TODO: aria props with label

export function ModeSelector({ children, label }: { children: React.ReactNode, label: string}) {
  return <div className="inline-block">
    <label>{label}</label>
    <div className="inline-block p-0.5 bg-gray-200 rounded-lg shadow-xs shadow-stone-400/40 ms-3">
      {children}
    </div>
  </div>
}

interface ModeButtonProps extends Omit<ButtonProps, 'minimal' | 'active'> {
  selected?: boolean
}

export function ModeButton({ selected, ...props }: ModeButtonProps) {
  return <Button {...props} minimal={!selected} paddingClass="py-[3px] px-2" className="rounded-md!" />
}
