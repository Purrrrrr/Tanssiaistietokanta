import React, {createContext, useContext, useEffect, useRef, useState} from 'react'
import {useHref} from 'react-router-dom'

import {sortedPaths} from './sortedPaths'

export interface Path {
  text: string | JSX.Element
  href: string
  current?: true
}

const RegisterContext = createContext({
  add: (_: Path) => { /* dummy function */ },
  remove: (_: Path) => { /* dummy function */ },
})
export const PathContext = createContext<Path[]>([])

export function BreadcrumbContext({children}) {
  const [paths, setPaths] = useState<Path[]>([])
  const val = useRef({
    add: (v: Path) => setPaths((old) => add(old, v)),
    remove: (v: Path) => setPaths((old) => remove(old, v)),
  })
  return <RegisterContext.Provider value={val.current}>
    <PathContext.Provider value={paths}>
      {children}
    </PathContext.Provider>
  </RegisterContext.Provider>
}

function add(array: Path[], value: Path) {
  const index = array.indexOf(value)
  return index === -1 ? [...array, value] : array
}

function remove(array: Path[], value: Path) {
  const index = array.indexOf(value)
  return index === -1 ? array : array.filter(item => item !== value)
}

export const Breadcrumb = React.memo(function ({text}: {text: Path['text']}) {
  const href = useHref('.')
  const paths = useContext(RegisterContext)
  useEffect(() => {
    const route = {text, href}
    paths.add(route)
    return () => paths.remove(route)
  }, [text, href, paths])

  return null
})

export function useBreadcrumbPaths() {
  const paths = sortedPaths(useContext(PathContext))
  if (paths.length > 0) {
    return [
      ...paths.slice(0, paths.length - 1),
      { ...paths[paths.length - 1], current: true } as Path,
    ]
  }
  return paths
}
