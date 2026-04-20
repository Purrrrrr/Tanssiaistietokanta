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
  introText?: React.ReactNode
  children: React.ReactNode
  toolbar?: React.ReactNode
  className?: string
}

export function PageSection({ title, syncStatus, introText, toolbar, children, className }: PageSectionProps) {
  return <section className={classNames('mb-10', className)}>
    <div className="@container flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
      <H2 className="">{title}</H2>
      {syncStatus && <SyncStatus state={syncStatus} className="mt-[6px]" />}
      {introText && <>
        <div className="w-full" />
        <div>{introText}</div>
      </>}
      {toolbar &&
        <div className="@min-[50cqw]:justify-end grow flex">
          {toolbar}
        </div>
      }
    </div>
    {children}
  </section>
}
