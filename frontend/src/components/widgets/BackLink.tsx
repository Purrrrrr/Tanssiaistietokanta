import { ArrowLeft } from '@blueprintjs/icons'

import { Link } from 'libraries/ui'

interface BackLinkProps {
  children: React.ReactElement | string,
  to?: string
}

export function BackLink({children, to = '..'} : BackLinkProps) {
  return <p style={{margin: '10px 0'}}>
    <Link to={to}><ArrowLeft />{children}</Link>
  </p>
}
