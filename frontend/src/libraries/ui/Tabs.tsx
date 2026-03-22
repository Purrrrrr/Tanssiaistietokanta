import { createLink } from '@tanstack/react-router'
import { Children, cloneElement, KeyboardEventHandler, useRef, useState } from 'react'
import classNames from 'classnames'

export interface TabsProps {
  className?: string
  children?: React.ReactNode
  id?: string
  defaultSelectedTabId?: string
  renderActiveTabPanelOnly?: boolean
  selectedTabId?: string
  /** A callback function that is invoked when a tab in the tab list is clicked. */
  onChange?(newTabId: string): void
}

export function Tabs(props: TabsProps) {
  const { className, children, renderActiveTabPanelOnly } = props
  const [selectedTabId, onChange] = useSelectedTabId(props)
  const tabs = Children.map(children, child => {
    if (typeof child !== 'object' || child === null || !('props' in child)) {
      return null
    }
    return child.props as TabProps
  })?.filter(tab => tab) ?? []

  return <>
    <TabButtonContainer className={className}>
      {Children.map(children, child => {
        if (typeof child !== 'object' || child === null || !('props' in child)) {
          return null
        }
        const { id: childId } = child.props as TabProps
        return cloneElement(child, {
          selected: childId === selectedTabId,
          onClick: () => onChange(childId),
        } as Partial<TabProps>)
      })}
    </TabButtonContainer>
    {tabs.map(tab => {
      const selected = tab.id === selectedTabId
      if (renderActiveTabPanelOnly && !selected) return null

      return <TabPanel key={tab.id} tabId={tab.id} selected={selected}>
        {tab.panel}
      </TabPanel>
    })}
  </>
}

const tabIdToPanelId = (id: string) => `tabs-${id}-panel`

function useSelectedTabId(props: TabsProps): [string | undefined, Exclude<TabsProps['onChange'], undefined>] {
  const [tab, setTab] = useState(props.defaultSelectedTabId)

  return [
    props.selectedTabId ?? tab,
    (tabId, ...rest) => {
      setTab(tabId)
      props.onChange?.(tabId, ...rest)
    },
  ] as const
}

function getEventDirection(key: string) {
  switch (key) {
    case 'ArrowLeft':
    case 'ArrowUp':
      return -1
    case 'ArrowRight':
    case 'ArrowDown':
      return 1
  }
  return 0
}

export function TabButtonContainer({ className, children }: { className?: string, children: React.ReactNode }) {
  const tabContainer = useRef<HTMLDivElement>(null)
  const onKeyDown: KeyboardEventHandler = (e) => {
    if (!tabContainer.current) return
    const { activeElement } = document
    if (!activeElement) return
    if (!tabContainer.current.contains(document.activeElement)) return

    const direction = getEventDirection(e.key)
    if (direction !== 0) {
      const { children, childElementCount: count } = tabContainer.current
      const index = Array.from(children).findIndex(child => child.id === activeElement.id)
      const next = index + direction
      const nextElement = children.item(next < 0 ? count - 1 : (next % count)) as HTMLElement | null
      nextElement?.focus()
    }
  }

  /* eslint-disable-next-line jsx-a11y/interactive-supports-focus */ /* This is good enough for now */
  return <div ref={tabContainer} className={classNames(className, 'flex flex-wrap gap-5 py-3')} role="tablist" onKeyDown={onKeyDown}>
    {children}
  </div>
}

export interface TabProps {
  disabled?: boolean
  /**
     * Unique identifier used to control which tab is selected
     * and to generate ARIA attributes for accessibility.
     */
  id: string
  panelId?: string
  selected?: boolean
  title?: React.ReactNode
  href?: string
  /** An icon element to render before the children. */
  icon?: React.ReactElement
  onClick?: () => void
  panel?: React.ReactNode
}

export function Tab({ title, href, icon, disabled, selected = false, panelId, panel: _panel, ...rest }: TabProps) {
  const isActiveLink = (rest as { className?: string }).className === 'active'
  const commonProps = {
    ...rest,
    role: 'tab',
    className: classNames('cursor-pointer pb-1', selected && 'border-b-3 border-b-blue-400'),
    'aria-expanded': selected || isActiveLink,
    'aria-controls': panelId ?? tabIdToPanelId(rest.id),
    tabIndex: selected ? 0 : -1,
  }

  if (href && !disabled) {
    return <a href={href} {...commonProps}>
      {icon}
      {title}
    </a>
  }

  return <button {...commonProps} disabled={disabled}>
    {icon}
    {title}
  </button>
}

export const TabLink = createLink(Tab)

export function TabPanel({ tabId, children, id, selected }: { tabId: string, children: React.ReactNode, id?: string, selected: boolean }) {
  return <div
    role="tabpanel"
    id={id ?? tabIdToPanelId(tabId)}
    className={selected ? '' : 'hidden'}
    aria-hidden={!selected}
    inert={!selected}
  >
    {children}
  </div>
}
