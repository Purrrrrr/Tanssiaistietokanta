import { lazy } from 'react'
import classNames from 'classnames'

import type { SyncState } from 'libraries/forms'
import { H2 } from 'libraries/ui'

const SyncStatus = lazy(
  () => import('libraries/forms/SyncStatus')
    .then(m => ({ default: m.SyncStatus })),
)

interface PageSectionProps {
  title: React.ReactNode
  syncStatus?: SyncState
  children: React.ReactNode
  toolbar?: React.ReactNode
  className?: string
}

export function PageSection({ title, syncStatus, toolbar, children, className }: PageSectionProps) {
  return <section className={classNames('mb-10', className)}>
    <div className="@container flex flex-wrap items-start gap-x-4 gap-y-1">
      <H2>{title}</H2>
      {syncStatus && <SyncStatus state={syncStatus} className="mt-[6px]" />}
      {toolbar &&
        <div className="@min-[50cqw]:justify-end grow flex">
          {toolbar}
        </div>
      }
    </div>
    {children}
  </section>
}
