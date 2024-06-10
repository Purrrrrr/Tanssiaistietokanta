import {Link} from 'react-router-dom'

import {Icon} from 'libraries/ui'

interface BackLinkProps {
  children: React.ReactElement | string,
  to?: string
}

export function BackLink({children, to = '..'} : BackLinkProps) {
  return <p style={{margin: '10px 0'}}>
    <Link to={to}><Icon icon="arrow-left"/>{children}</Link>
  </p>
}
