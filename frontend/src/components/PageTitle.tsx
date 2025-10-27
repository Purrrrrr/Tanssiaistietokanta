import { useEffect } from 'react'

export function PageTitle({ children, noRender }: { children: string, noRender?: boolean }) {
  useEffect(
    () => {
      setPageSubtitle(children)
    },
    [children],
  )

  return noRender ? null : <h1>{children}</h1>
}

function setPageSubtitle(title: string) {
  document.title = getPageMainTitle() + ' - ' + title
}

let mainTitle: string
function getPageMainTitle() {
  mainTitle ??= document.title
  return mainTitle
}
