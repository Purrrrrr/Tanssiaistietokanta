import classNames from 'classnames'

import { useShouldRender } from 'libraries/common/useShouldRender'

export interface CollapseProps {
  children?: React.ReactNode
  isOpen?: boolean
  keepChildrenMounted?: boolean
}

export default function Collapse({ children, isOpen = false, keepChildrenMounted }: CollapseProps) {
  const shouldrender = useShouldRender(isOpen, 200)

  return <div className={classNames(
    'grid transition-[grid-template-rows] duration-300',
    isOpen ? '[grid-template-rows:1fr]' : '[grid-template-rows:0fr]',
  )}>
    <div className={classNames('overflow-hidden', shouldrender && 'p-px')}>
      {(isOpen || shouldrender || keepChildrenMounted) && children}
    </div>
  </div>
}
