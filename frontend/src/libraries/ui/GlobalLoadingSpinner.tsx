import classNames from 'classnames'

import { ColorClass } from './classes'

export function GlobalSpinner({loading, timeout, connectionTimeoutMessage}) {
  const className = classNames(
    // 'global-loading-spinner', {loading, timeout},
    'grid items-center justify-center fixed inset-0 z-100 transition-[opacity,background] pointer-events-none',
    loading ? 'opacity-100' : 'opacity-0',
    timeout ? 'bg-black/20' : 'bg-white/60'
  )
  return <div className={className}>
    <div className={classNames(
      'flex flex-col gap-6 items-center',
      timeout && 'bg-white rounded-2xl w-fit p-4 shadow-lg shadow-black/20',
    )}>
      <img className="h-15 sepia-50" src="/loading.gif" />
      {timeout && <h2 className={ColorClass.textMuted+' my-2 font-bold text-lg'}>{connectionTimeoutMessage}</h2>}
    </div>
  </div>
}
