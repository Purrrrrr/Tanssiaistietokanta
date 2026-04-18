import { Link, LinkComponent } from '@tanstack/react-router'
import classNames from 'classnames'

import { ColorClass } from './classes'

export function BreadcrumbsContainer({ label, children }: { label: string, children: React.ReactNode }) {
  return <ul id="breadcrumbs" className="@container grow flex flex-wrap gap-2 items-center" aria-label={label}>
    {children}
  </ul>
}

function BreadcrumbLink_({ text, children, ...props }: React.ComponentProps<typeof Link> & { children?: React.ReactNode, text?: React.ReactNode }) {
  const liClass = 'flex gap-2 items-center h-7.5 not-last:after:bg-[url("/breadcrumb-arrow.svg")] not-last:after:size-4 not-last:after:block @max-sm:not-last:not-nth-last-2:hidden'
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
  </li>
}
type FakeLinkComponentType = (props: React.ComponentProps<'a'> & { text?: React.ReactNode }) => React.ReactNode
export const Breadcrumb = BreadcrumbLink_ as LinkComponent<FakeLinkComponentType>
