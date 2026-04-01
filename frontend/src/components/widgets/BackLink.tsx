import { createLink } from '@tanstack/react-router'

import { RegularLink } from 'libraries/ui'
import { ArrowLeft } from 'libraries/ui/icons'

export const BackLink = createLink(({ children, ...rest }: React.ComponentProps<'a'>) =>
  <p className="py-2">
    <RegularLink {...rest}><ArrowLeft />{children}</RegularLink>
  </p>,
)
