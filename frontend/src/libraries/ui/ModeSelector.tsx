import classNames from 'classnames'

import { Button, ButtonProps } from './Button'

export function ModeSelector({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={classNames(className, 'inline-block p-0.5 bg-gray-200 rounded-lg shadow-xs shadow-stone-400/40')}>
    {children}
  </div>
}

interface ModeButtonProps extends Omit<ButtonProps, 'minimal' | 'active'> {
  selected?: boolean
}

export function ModeButton({ selected, ...props }: ModeButtonProps) {
  return <Button {...props} minimal={!selected} paddingClass="py-[3px] px-2" className="rounded-md!" />
}
