import { useLayoutEffect, useState } from 'react'
import classNames from 'classnames'

export interface CollapseProps {
  children?: React.ReactNode;
  isOpen?: boolean;
  keepChildrenMounted?: boolean;
}

export function Collapse({children, isOpen, keepChildrenMounted}: CollapseProps) {
  const [shouldrender, setShouldRender] = useState(false)
  useLayoutEffect(() => {
    if (isOpen) {
      setShouldRender(true)
    } else {
      const id = setTimeout(() => setShouldRender(false), 200)
      return () => clearTimeout(id)
    }
  }, [isOpen])

  return <div className={classNames(
    'grid transition-[grid-template-rows] duration-300',
    isOpen ? '[grid-template-rows:1fr]' : '[grid-template-rows:0fr]',
  )}>
    <div className={classNames('overflow-hidden', shouldrender && 'p-px')}>
      {(isOpen || shouldrender || keepChildrenMounted) && children}
    </div>
  </div>
}
