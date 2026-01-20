import { Link } from 'libraries/ui'
import { ArrowLeft } from 'libraries/ui/icons'

interface BackLinkProps {
  children: React.ReactElement | string
  to?: string
}

export function BackLink({ children, to = '..' }: BackLinkProps) {
  return <p style={{ margin: '10px 0' }}>
    <Link to={to}><ArrowLeft />{children}</Link>
  </p>
}
