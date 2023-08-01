import React  from 'react'
import {useLinkClickHandler} from 'react-router-dom'

import {MenuItem, MenuItemProps} from 'libraries/ui'

export function LinkMenuItem({ href, ...props}: MenuItemProps & {href: string}) {
  const onClick =  useLinkClickHandler(href)

  return <MenuItem onClick={onClick as MenuItemProps['onClick']} {...props} />
}
