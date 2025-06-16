import {Link} from 'react-router-dom'
import classNames from 'classnames'

import {Path, useBreadcrumbPaths} from './context'

export {Breadcrumb, BreadcrumbContext} from './context'

export function Breadcrumbs({label}: {label: string}) {
  const paths = useBreadcrumbPaths()
  //Manually create the breadcrumb element since the Blueprint one is not fully accessible
  return <ul id="breadcrumbs" className="flex flex-wrap items-center gap-2" aria-label={label}>
    {paths.map(path =>
      <li className="flex items-center h-7.5 gap-2 not-last:after:bg-[url('/breadcrumb-arrow.svg')] not-last:after:size-4 not-last:after:block" key={path.href}>
        <Breadcrumb {...path} />
      </li>
    )}
  </ul>
}

function Breadcrumb({href, current, text} : Path) {
  return <Link
    className={classNames(
      'flex items-center ',
      !current && 'text-gray-500 hover:text-gray-700',
      current && 'font-semibold'
    )}
    aria-current={current ? 'page' : undefined}
    to={href}
  >
    {text}
  </Link>
}
