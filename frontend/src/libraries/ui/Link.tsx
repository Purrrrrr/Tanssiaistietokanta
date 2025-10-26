import { ComponentProps } from 'react'
import {Link as RouterLink} from 'react-router-dom'
import classNames from 'classnames'

const className = 'cursor-pointer hover:underline text-link'

export function RegularLink({ unstyled, children, ...props }: ComponentProps<'a'> & { unstyled?: boolean }) {
  return <a
    {...props}
    className={classNames(
      props.className,
      unstyled || className,
    )}
  >
    {children}
  </a>
}

export function Link({ unstyled, ...props }: ComponentProps<typeof RouterLink> & { unstyled?: boolean }) {
  return <RouterLink
    {...props}
    className={classNames(
      props.className,
      unstyled || className,
    )}
  />
}
