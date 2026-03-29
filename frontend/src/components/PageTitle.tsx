import { useEffect } from 'react'

type PagetTitleProps = {
  children: string
  text?: never
  noRender?: boolean
} | {
  children: Exclude<React.ReactNode, string | number>
  text: string
  noRender?: boolean
}

export function PageTitle({ text, children, noRender }: PagetTitleProps) {
  useEffect(
    () => {
      setPageSubtitle(text ?? children)
    },
    [text, children],
  )

  return noRender ? null : <h1 className="h1">{children}</h1>
}

function setPageSubtitle(title: string) {
  document.title = getPageMainTitle() + ' - ' + title
}

let mainTitle: string
function getPageMainTitle() {
  mainTitle ??= document.title
  return mainTitle
}
