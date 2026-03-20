import { createLink } from '@tanstack/react-router'

import { RegularLink } from 'libraries/ui'
import { ArrowLeft } from 'libraries/ui/icons'

export const BackLink = createLink(({ children, ...rest }: React.ComponentProps<'a'>) =>
  <p style={{ margin: '10px 0' }}>
    <RegularLink {...rest}><ArrowLeft />{children}</RegularLink>
  </p>,
)
