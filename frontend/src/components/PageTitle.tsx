import React, {useEffect} from 'react'

export function PageTitle({children} : {children: string}) {
  useEffect(
    () => {
      setPageSubtitle(children)
    },
    [children]
  )

  return <h1>{children}</h1>
}

function setPageSubtitle(title : string) {
  document.title = getPageMainTitle() + ' - ' + title

}

let mainTitle : string
function getPageMainTitle() {
  if (mainTitle === undefined) mainTitle = document.title
  return mainTitle
}
