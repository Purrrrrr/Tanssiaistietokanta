import { Children, Fragment, isValidElement } from 'react'
import classNames from 'classnames'

import { Button, type ButtonProps } from '../../Button'
import { OverflowList, OverflowListItem } from '../../OverflowList'
import type { Column, RowState } from '../column'
import { columnDefaults } from '../column'
import { ColumnOptionsMenu } from '../ColumnOptionsMenu'
import { useT } from '../i18n'
import type { ColumnVisibilityApi } from './useColumnVisibility'
import type { ItemListSortState } from './useItemSorting'

export interface ActionsColumnProps<T> {
  actions?: false | ActionsColumnOptions<T>['content'] | ActionsColumnOptions<T>
  expandButtonProps?: Partial<ButtonProps> | ((item: T, state: RowState) => Partial<ButtonProps>)
}

export interface ActionsColumnOptions<T> {
  content: ((item: T, index: number) => React.ReactNode | React.ReactNode[] | OverflowListItem[]) | null
  useOverflowMenu?: boolean
  reflowArea?: string
  className?: string
}

export function useActionsColumn<T extends { _id: string | number }>(
  sortApi: ItemListSortState<T>,
  visibilityApi: ColumnVisibilityApi<T>,
  { expandButtonProps, expandableContent, actions }: ActionsColumnProps<T> & { expandableContent?: unknown },
): Column<T> | null {
  const t = useT('')
  const hasExpandableContent = expandableContent != null
  const hasActionsColumn = !!actions || sortApi.sortableColumns.length > 1 || hasExpandableContent

  if (!hasActionsColumn) return null
  const { content, className: actionsColumnClassName, reflowArea, useOverflowMenu } = getActionOptions(actions)

  return {
    ...columnDefaults,
    id: 'itemlist-actions',
    reflowArea,
    width: 'auto',
    link: null,
    label: <ColumnOptionsMenu {...sortApi} visibilityApi={visibilityApi} hasActions={content !== null} />,
    content: (item, rowState) => actionColumnContent(
      content?.(item, rowState.index),
      hasExpandableContent && <Button
        iconOnly
        text={t(rowState.expanded ? 'closeDetails' : 'openDetails')}
        {...(typeof expandButtonProps === 'function' ? expandButtonProps(item, rowState) : expandButtonProps)}
        minimal
        rightIcon={rowState.expanded ? 'chevronUp' : 'chevronDown'}
        onClick={() => rowState.setExpanded(!rowState.expanded)}
      />,
      useOverflowMenu ?? false,
    ),
    headerClassName: 'itemlist-sortable-header itemlist-sort-menu',
    headerPaddingClassName: '',
    className: actionsColumnClassName,
  }
}

function actionColumnContent(contents: React.ReactNode | OverflowListItem[] | React.ReactNode[], expandButton: React.ReactNode, overflowMenu: boolean): React.ReactNode {
  if (!overflowMenu) {
    return <>{contents}{expandButton}</>
  }
  const items: OverflowListItem[] = Array.isArray(contents)
    ? contents.map((content: OverflowListItem | React.ReactNode) =>
      content && typeof content === 'object' && 'content' in content
        ? content
        : { content },
    )
    : unwrap(contents).map((content) => ({ content }))
  if (expandButton) items.push({ content: expandButton, alwaysVisible: true })

  return <OverflowList align="right" items={items} />
}

const unwrap = (node: React.ReactNode): React.ReactNode[] => {
  if (node === null || node === undefined) return []
  if (isValidElement(node) && node.type === Fragment) return Children.toArray((node.props as { children: React.ReactNode }).children)
  return [node]
}

function getActionOptions<T extends { _id: string | number }>(actions: ActionsColumnProps<T>['actions']): Required<ActionsColumnOptions<T>> {
  const defaults = {
    content: null,
    className: 'actions min-w-0',
    reflowArea: 'actions',
    useOverflowMenu: false,
  }
  if (actions === false || actions == undefined) {
    return defaults
  }
  if (typeof actions === 'function') {
    return { ...defaults, content: actions }
  }
  return { ...defaults, ...actions, className: classNames(defaults.className, actions.className) }
}
