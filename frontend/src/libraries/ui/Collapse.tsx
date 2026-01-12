import { Suspense } from 'react'
import classNames from 'classnames'

import { useShouldRender } from 'libraries/common/useShouldRender'

import { LoadingSpinner } from './LoadingSpinner'

export interface CollapseProps {
  children?: React.ReactNode
  isOpen?: boolean
  keepChildrenMounted?: boolean
  loadingMessage?: string
}

export default function Collapse({ children, isOpen = false, keepChildrenMounted, loadingMessage }: CollapseProps) {
  const shouldrender = useShouldRender(isOpen, 200)

  return <div className={classNames(
    'grid transition-[grid-template-rows] duration-300',
    isOpen ? '[grid-template-rows:1fr]' : '[grid-template-rows:0fr]',
  )}>
    <div className={classNames('overflow-hidden', shouldrender && 'p-px')}>
      <Suspense fallback={<LoadingSpinner loadingMessage={loadingMessage} />}>
        {(isOpen || shouldrender || keepChildrenMounted) && children}
      </Suspense>
    </div>
  </div>
}
