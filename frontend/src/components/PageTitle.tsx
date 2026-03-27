import { useEffect } from 'react'

import { H1 } from 'libraries/ui'

export function PageTitle({ children, noRender }: { children: string, noRender?: boolean }) {
  useEffect(
    () => {
      setPageSubtitle(children)
    },
    [children],
  )

  return noRender ? null : <H1>{children}</H1>
}

function setPageSubtitle(title: string) {
  document.title = getPageMainTitle() + ' - ' + title
}

let mainTitle: string
function getPageMainTitle() {
  mainTitle ??= document.title
  return mainTitle
}
