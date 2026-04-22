import { Link, LinkComponent } from '@tanstack/react-router'
import classNames from 'classnames'

import MenuButton from 'libraries/formsV2/components/MenuButton'

import { Button } from './Button'
import { ColorClass } from './classes'

export function BreadcrumbsContainer({ label, children }: { label: string, children: React.ReactNode }) {
  return <ul id="breadcrumbs" className="@container grow flex flex-wrap items-center" aria-label={label}>
    {children}
  </ul>
}

interface BreadcrumbLinkProps extends React.ComponentProps<typeof Link> {
  text?: React.ReactNode
  children?: React.ReactNode
  menu?: React.ReactNode
}

function BreadcrumbLink_({ text, children, menu, ...props }: BreadcrumbLinkProps) {
  const liClass = classNames('group flex items-center h-7.5 @max-sm:not-last:not-nth-last-2:hidden')
  const linkClass = 'flex items-center hover:text-link'
  return <li className={liClass}>
    <Link
      inactiveProps={{ className: classNames(linkClass, ColorClass.textMuted) }}
      activeProps={{ className: classNames(linkClass, 'font-semibold'), 'aria-current': 'page' }}
      activeOptions={{ exact: true, includeSearch: false }}
      {...props}
    >
      {text}
      {children}
    </Link>
    {menu
      ? (
        <MenuButton
          containerClassname="p-1"
          buttonRenderer={
            props => <Button {...props} minimal paddingClass="p-1"><img src="/breadcrumb-arrow.svg" alt="" className="size-4" /></Button>
          }
        >
          {menu}
        </MenuButton>
      )
      : <span className="group-last:hidden mx-2"><img src="/breadcrumb-arrow.svg" alt="" className="size-4" /></span>
    }
  </li>
}
type FakeLinkComponentType = (props: React.ComponentProps<'a'> & Pick<BreadcrumbLinkProps, 'text' | 'menu'>) => React.ReactNode
export const Breadcrumb = BreadcrumbLink_ as LinkComponent<FakeLinkComponentType>
