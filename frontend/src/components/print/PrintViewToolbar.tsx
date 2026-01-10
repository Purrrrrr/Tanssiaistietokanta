import { useState } from 'react'
import { DoubleChevronUp, Settings } from 'libraries/ui/icons'
import classNames from 'classnames'

interface PrintViewToolbarProps {
  children: React.ReactNode
  maxHeight?: number
}

export default function PrintViewToolbar({ children, maxHeight }: PrintViewToolbarProps) {
  const [isOpen, setOpen] = useState(true)

  return <div
    className={classNames(
      'flex justify-center bg-white border-b duration-500 print:hidden transition-[max-height] shadow-[0_0_10px_rgba(0,0,0,0.5)] border-b-gray-400',
      isOpen ? 'max-h-20' : 'max-h-0',
    )}
    style={isOpen && maxHeight ? { maxHeight } : undefined}
  >
    <button
      className={classNames(
        'absolute top-3 right-3 p-2 rounded-full transition-[background,_opacity] hover:bg-white/50',
        isOpen ? 'opacity-0' : 'opacity-80 delay-[0ms,_400ms]',
      )}
      onFocus={() => setOpen(true)}
    >
      <Settings size={20} />
    </button>
    <div
      className={classNames(
        'overflow-y-auto p-2 max-h-20 transition max-w-[1200px]',
        isOpen || 'opacity-0 -translate-y-full',
      )}
      style={maxHeight ? { maxHeight } : undefined}
    >
      {children}
    </div>
    <button
      className={classNames(
        'absolute top-1 right-3 p-2 hover:bg-gray-200',
        isOpen ? 'transform-none' : 'transition opacity-0 -translate-y-full',
      )}
      onClick={() => setOpen(false)}
    >
      <DoubleChevronUp size={20} />
    </button>
  </div>
}
