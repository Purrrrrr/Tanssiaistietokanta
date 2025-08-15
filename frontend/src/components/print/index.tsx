import classNames from 'classnames'

import { AutosizedSection } from 'libraries/ui'

import PrintViewToolbar from './PrintViewToolbar'

export { PrintViewToolbar }

export function PrintPageContainer({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh not-print:bg-gray-500 not-print:pb-4">
    {children}
  </div>
}

interface PageProps {
  onePage?: boolean
  landscape?: boolean
  children: React.ReactNode
}

export function A4Page({ children, landscape, onePage }: PageProps) {
  return <main className={classNames(
    'mx-auto  p-[4mm] bg-white shadow-black/50 not-print:shadow-xl',
    landscape
      ? 'h-[210mm]'
      : 'w-[210mm]',
    landscape
      ? onePage ? 'w-[297mm] overflow-hidden' : 'min-w-[297mm]'
      : onePage ? 'h-[297mm] overflow-hidden' : 'min-h-[297mm]'
  )}>
    {children}
  </main>
}

interface RepeatingGridProps {
  cols: number
  rows: number
  children: React.ReactNode
  repeatChildren?: boolean
}

export function RepeatingGrid({cols, rows, children, repeatChildren}: RepeatingGridProps) {
  return <div
    style={{ '--cols': cols, '--rows': rows} as React.CSSProperties}
    className="max-h-full grid grid-cols-[repeat(var(--cols),1fr)] grid-rows-[repeat(var(--rows),1fr)] gap-1"
  >
    {repeatChildren
      ? Array(cols * rows).fill(1).map((_, i) =>
        <AutosizedSection key={`${rows}-${cols}-${i}`}>{children}</AutosizedSection>
      )
      : children
    }
  </div>

}
