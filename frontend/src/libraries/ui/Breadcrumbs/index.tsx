import React from 'react'
import {Link} from 'react-router-dom'
import {Classes} from '@blueprintjs/core'

import {Path, useBreadcrumbPaths} from './context'

export {Breadcrumb, BreadcrumbContext} from './context'

export function Breadcrumbs({label}: {label: string}) {
  const paths = useBreadcrumbPaths()
  //Manually create the breadcrumb element since the Blueprint one is not fully accessible
  return <ul id="breadcrumbs" className={Classes.BREADCRUMBS} aria-label={label}>
    {paths.map(path => <li key={path.href}><Breadcrumb {...path} /></li>)}
  </ul>
}

function Breadcrumb({href, current, text} : Path) {
  return <Link {...(current ? currentLinkProps : linkProps)} to={href}>{text}</Link>
}

const linkProps = {className: Classes.BREADCRUMB}
const currentLinkProps = {
  className: Classes.BREADCRUMB + ' ' + Classes.BREADCRUMB_CURRENT,
  'aria-current': 'page',
}
