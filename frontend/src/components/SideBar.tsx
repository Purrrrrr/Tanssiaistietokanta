import React, { ReactNode, useCallback, useContext, useEffect, useId, useRef, useState } from 'react'

import { useResizeObserver } from 'libraries/ui'

type SidebarRegisterContextType = (id: string, content: ReactNode) => () => void
const SidebarRegisterContext = React.createContext<SidebarRegisterContextType>(() => () => {})

const SidebarContentContext = React.createContext<Record<string, ReactNode>>({})

export default function SideBar({ children }: { children: ReactNode }) {
  const register = useContext(SidebarRegisterContext)
  const id = useId()
  useEffect(() => {
    return register(id, children)
  }, [register, id, children])

  return null
}

export function SidebarContainer() {
  const data = useContext(SidebarContentContext)
  const container = useRef<HTMLDivElement>(null)

  const updateHeight = useCallback(
    (entries: { target: Element }[]) => {
      const [{ target }] = entries
      const h = target?.scrollHeight ?? 0
      if (h > 0) {
        document.body.style.setProperty('--sidebar-opened-height', `${h}px`)
      }
    },
    [],
  )
  useResizeObserver(container, updateHeight)

  if (!data) return null
  return <div ref={container}>
    {Object.entries(data).map(([id, content]) => <React.Fragment key={id}>{content}</React.Fragment>)}
  </div>
}

export function SidebarContext({ children }) {
  const [contents, setContents] = useState<Record<string, ReactNode>>({})
  const register = useCallback(
    (id: string, content: ReactNode) => {
      setContents(c => ({ ...c, [id]: content }))
      return () => setContents(({ [id]: _lost, ...c }) => c)
    },
    [],
  )

  return <SidebarRegisterContext.Provider value={register}>
    <SidebarContentContext.Provider value={contents}>
      {children}
    </SidebarContentContext.Provider>
  </SidebarRegisterContext.Provider>
}
