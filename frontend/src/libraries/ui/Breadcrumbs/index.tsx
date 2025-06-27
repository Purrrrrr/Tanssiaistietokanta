import {Link} from 'react-router-dom'
import classNames from 'classnames'

import { ColorClass } from '../classes'
import {Path, useBreadcrumbPaths} from './context'

export {Breadcrumb, BreadcrumbContext} from './context'

export function Breadcrumbs({label}: {label: string}) {
  const paths = useBreadcrumbPaths()
  //Manually create the breadcrumb element since the Blueprint one is not fully accessible
  return <ul id="breadcrumbs" className="flex flex-wrap gap-2 items-center" aria-label={label}>
    {paths.map(path =>
      <li className="flex gap-2 items-center h-7.5 not-last:after:bg-[url('/breadcrumb-arrow.svg')] not-last:after:size-4 not-last:after:block" key={path.href}>
        <Breadcrumb {...path} />
      </li>
    )}
  </ul>
}

function Breadcrumb({href, current, text} : Path) {
  return <Link
    className={classNames(
      'flex items-center hover:text-link',
      !current && ColorClass.textMuted,
      current && 'font-semibold'
    )}
    aria-current={current ? 'page' : undefined}
    to={href}
  >
    {text}
  </Link>
}
