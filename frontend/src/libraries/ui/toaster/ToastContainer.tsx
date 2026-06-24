import classNames from 'classnames'

import { ColorClass } from 'libraries/ui/classes'

import { Popover } from '../overlays/unstyled/Popover'
import { type ToastData, useToastStore } from './context'

export function ToastContainer() {
  const toasts = useToastStore()

  return <section aria-live="assertive">
    <Popover type="manual" open={toasts.length > 0} className="flex left-1/2 flex-col gap-4 p-10 bg-transparent -translate-x-1/2">
      {toasts.map(({ id, ...rest }) => <Toast key={id} {...rest} />)}
    </Popover>
  </section>
}

function Toast({ onClose, closing, toast }: Omit<ToastData, 'id'>) {
  return <div className={classNames(
    'flex items-start gap-2 shadow-lg shadow-stone-500/40 starting:opacity-0 transition-opacity border-1 border-black/50 rounded-sm',
    ColorClass.boxColors[toast.color ?? 'none'],
    closing && 'opacity-0',
  )}>

    <div className="p-3">{toast.message}</div>
    {
      toast.isCloseButtonShown !== false &&
        <button className="p-1 mt-1 cursor-pointer me-1 hover:bg-gray-800/20" onClick={onClose}>X</button>
    }
  </div>
}
