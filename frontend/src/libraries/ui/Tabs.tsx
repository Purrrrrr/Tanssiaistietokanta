import { Children, ComponentProps, KeyboardEventHandler, useId, useRef, useState } from 'react'
import classNames from 'classnames'

import { IconProp, renderIcon } from './Icon'

type TabId = string | number

export interface TabProps extends Omit<ComponentProps<'div'>, 'id' | 'title' | 'onClick'> {
    disabled?: boolean;
    /**
     * Unique identifier used to control which tab is selected
     * and to generate ARIA attributes for accessibility.
     */
    id: TabId;
    /**
     * Panel content, rendered by the parent `Tabs` when this tab is active.
     * If omitted, no panel will be rendered for this tab.
     * Can either be an element or a renderer.
     */
    panel?: React.JSX.Element | ((props: {
        tabTitleId: string;
        tabPanelId: string;
    }) => React.JSX.Element);
    title?: React.ReactNode;
    /** Name of a Blueprint UI icon (or an icon element) to render before the children. */
    icon?: IconProp
}

export function Tab(_: TabProps) {
  return null
}

export interface TabsProps {
  className?: string
  children?: React.ReactNode;
  id?: string
  defaultSelectedTabId?: TabId
  renderActiveTabPanelOnly?: boolean;
  selectedTabId?: TabId;
  /**
   * Whether to show tabs stacked vertically on the left side.
   *
   * @default false
   */
  vertical?: boolean;
  /**
   * A callback function that is invoked when a tab in the tab list is clicked.
   */
  onChange?(newTabId: TabId, prevTabId: TabId | undefined, event: React.MouseEvent<HTMLElement>): void;
}



export function Tabs(props: TabsProps) {
  const id = useId()
  const tabContainer = useRef<HTMLDivElement>(null)
  const { className, children, renderActiveTabPanelOnly } = props
  const [selectedTabId, onChange] = useSelectedTabId(props)
  const tabs = Children.map(children, child => {
    if (typeof child !== 'object' || child === null || !('props' in child )) {
      return null
    }
    return child.props as TabProps
  })?.filter(tab => tab) ?? []

  const onKeyDown : KeyboardEventHandler = (e) => {
    if (!tabContainer.current) return
    const { activeElement } = document
    if (!activeElement) return
    if (!tabContainer.current.contains(document.activeElement)) return

    const direction = getEventDirection(e.key)
    if (direction !== 0) {
      const { children } = tabContainer.current
      const index = Array.from(tabContainer.current.children).findIndex(child => child.id === activeElement.id)
      const next = index + direction
      const count = tabs.length
      console.log(index, next, count)
      const nextElement = children.item(next < 0 ? count - 1 : (next % count)) as HTMLElement | null
      nextElement?.focus()
      console.log(nextElement)
    }
  }

  return <>
    <div ref={tabContainer} className={classNames(className, 'flex flex-wrap gap-5 py-3')} role="tablist" onKeyDown={onKeyDown}>
      {tabs.map((tab, index) => {
        const selected = tab.id === selectedTabId
        const { title, icon, disabled }= tab

        return <button
          role="tab"
          className={classNames('cursor-pointer pb-1', selected && 'border-b-3 border-b-blue-400')}
          id={tabId(id, tab, index)}
          aria-expanded={selected}
          disabled={disabled}
          aria-controls={panelId(id, tab, index)}
          tabIndex={selected ? 0 : -1}
          onClick={(e) => onChange(tab.id, selectedTabId, e)}
        >
          {renderIcon(icon)}
          {title}
        </button>
      })}
    </div>
    {tabs.map((tab, index) => {
      const selected = tab.id === selectedTabId
      if (renderActiveTabPanelOnly && !selected) return null

      const tabPanelId = panelId(id, tab, index)
      return <div
        role="tabpanel"
        id={tabPanelId}
        className={selected ? '' : 'hidden'}
        aria-hidden={!selected}
        inert={selected ? undefined : 'inert'}
      >
        {
          typeof tab.panel === 'function'
            ? tab.panel({ tabTitleId: tabId(id, tab, index), tabPanelId })
            : tab.panel
        }
      </div>
    })}
  </>
}

const tabId = (id: string, tab: TabProps, index: number) => `tabs-${id}-tab-${tab.id}-tab${index}`
const panelId = (id: string, tab: TabProps, index: number) => `tabs-${id}-panel-${tab.id}-tab${index}`

function useSelectedTabId(props: TabsProps): [TabId | undefined, Exclude<TabsProps['onChange'], undefined>] {
  const [tab, setTab] = useState(props.defaultSelectedTabId)

  return [
    props.selectedTabId ?? tab,
    (tabId, ...rest) => {
      setTab(tabId)
      props.onChange?.(tabId, ...rest)
    }
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
