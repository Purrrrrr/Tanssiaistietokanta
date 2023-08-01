import React  from 'react'
import {useLinkClickHandler} from 'react-router-dom'

import {MenuItem, MenuItemProps} from 'libraries/ui'

export function LinkMenuItem(props: MenuItemProps & {href: string}) {
  const onClick =  useLinkClickHandler(props.href)

  return <MenuItem onClick={onClick as MenuItemProps['onClick']} {...props} />
}
