import { ReactNode } from 'react'

import { Accessor, PathAccessor, toAccessorFn } from 'libraries/common/accessor'
import { SortKey } from 'utils/sorted'

export interface Column<T> extends CommonProps {
  id: number | string
  label: ReactNode
  content: (item: T, state: RowState) => React.ReactNode
  sortBy?: null | SortKey<T>
}

export type ColumnInput<T, Key> = Partial<CommonProps> & (
  | {
    /** Defines the translation key for the column label. If not provided, the label will be derived from the key. */
    key: Key
    /** Label content override */
    label?: string
  }
  | {
    /** No translation happens when the key is a string or number, so the label must be provided. */
    key: string | number
    label: string
  }
) & (
  | {
    /** The key doubles as the content accessor when sortableContent and content are not provided. It's also the default for the sort value */
    key: PathAccessor<T, SortableNode>
    sortableContent?: never
    content?: Content<T, ReactNode>
    sortBy?: SortKey<T> | null
  }
  | {
    /** If the key value is renderable, but not sortable, you can provide a separate accessor for the sort value. */
    key: PathAccessor<T, ReactNode>
    sortableContent?: never
    content?: never
    sortBy: SortKey<T> | null
  }
  | {
    /** If the key value is not sortable, you can provide an accessor for both rendered content and sort value. */
    key: string | number
    sortableContent: Content<T, SortableNode>
    content?: never
    sortBy?: never
  }
  | {
    /** You can also provide an accessor for the rendered content and a separate accessor for the sort value. */
    key: string | number
    sortableContent?: never
    content: Content<T, ReactNode>
    sortBy: SortKey<T> | null
  }
)

type Content<T, Result> = ((item: T, state: RowState) => Result) | PathAccessor<T, Result>
type SortableNode = Exclude<React.ReactNode, object>

export interface RowState {
  index: number
  expanded: boolean | undefined
  setExpanded: (expanded: boolean) => void
}

interface CommonProps {
  width: string
  labelInfo?: React.ReactNode
  className?: string
  wrapLabeled: boolean
  wrappedBreakAfter: boolean
  headerClassName?: string
  headerPaddingClassName?: string
  // TODO: controls for column layout on small screens, e.g. hide on mobile, full width on mobile, etc
  // TODO: Add these back in when we implement column visibility
  // visibility: 'always' | 'hidable' | 'hiddenByDefault' // Is the column always visible or can the user choose to hide this column? 'always' by default
  enabled: boolean // Should this column exist in this table? True by default. Used to exclude columns in certain tables without removing them from the column list
}

export const columnDefaults: CommonProps = {
  width: 'auto',
  className: '',
  headerClassName: '',
  wrapLabeled: false,
  wrappedBreakAfter: false,
  // visibility: 'always',
  enabled: true,
}

export function normalizeColumnInput<T, Key>(input: ColumnInput<T, Key>, labelTranslator: ((key: Key) => string) | undefined): Column<T> {
  const { key, label, sortableContent, content, sortBy, ...rest } = input
  return {
    ...columnDefaults,
    ...rest,
    id: key,
    label: label ?? labelTranslator?.(key as Key) ?? null,
    content: toAccessorFn((sortableContent ?? content ?? key) as Accessor<T, ReactNode>),
    sortBy: sortBy === null
      ? null
      : (sortBy ?? toAccessorFn((sortableContent ?? key) as Accessor<T, ReactNode>)) as SortKey<T>,
  }
}
