import {useState} from 'react'
import classNames from 'classnames'

import {Icon, IconName} from 'libraries/ui'

interface PrintViewToolbarProps {
  children: React.ReactNode,
  icon?: IconName,
  maxHeight?: number
}

export default function PrintViewToolbar({children, icon = 'settings', maxHeight} : PrintViewToolbarProps) {
  const [isOpen, setOpen] = useState(true)

  return <div
    className={classNames(
      'flex justify-center print:hidden transition-[max-height] duration-500 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] border-b border-b-gray-400',
      isOpen ? 'open max-h-20' : 'max-h-0',
    )}
    style={isOpen && maxHeight ? {maxHeight} : undefined}
  >
    <button
      className={classNames(
        'more absolute right-3 top-3 p-2 hover:bg-white/50 rounded-full transition-[background,_opacity]',
        isOpen ? 'opacity-0' : 'opacity-80 delay-[0ms,_400ms]',
      )}
      onFocus={() => setOpen(true)}
    >
      <Icon icon={icon} iconSize={20} />
    </button>
    <div
      className={classNames(
        'print-toolbar-contents p-2 max-h-20 max-w-[800px] transition overflow-y-auto',
        isOpen || 'opacity-0 -translate-y-full'
      )}
      style={maxHeight ? {maxHeight} : undefined}
    >
      {children}
    </div>
    <button
      className={classNames(
        'close absolute right-3 top-1 p-2 hover:bg-gray-200',
        isOpen ? 'transform-none' : 'transition opacity-0 -translate-y-full'
      )}
      onClick={() => setOpen(false)}
    >
      <Icon icon="double-chevron-up" iconSize={20} />
    </button>
  </div>
}
