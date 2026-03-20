import { createLink } from '@tanstack/react-router'
import { ComponentProps } from 'react'
import classNames from 'classnames'

const className = 'cursor-pointer hover:underline text-link'

export function RegularLink({ unstyled = false, children, ...props }: ComponentProps<'a'> & { unstyled?: boolean }) {
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

export const Link = createLink(RegularLink)
