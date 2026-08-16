import { PathAccessor, toAccessorFn } from 'libraries/common/accessor'
import { SortKey } from 'utils/sorted'

export interface Column<T> extends CommonProps {
  id: number | string
  label: LabelProps
  content: (item: T, state: RowState) => React.ReactNode
  sortBy: null | SortProps<T>
}

export type ColumnInput<T> = GetData<T> & Partial<CommonProps> & {
  label?: LabelProps | React.ReactNode
}

type GetData<T> = {
  content: PathAccessor<T, SortableNode>
  sortBy?: Sorting<T>
} | {
  content: (item: T, state: RowState) => SortableNode
  sortBy: Sorting<T> | { name: string, value?: never }
} | {
  content: (item: T, state: RowState) => UnsortableNode | PathAccessor<T, UnsortableNode>
  sortBy: Sorting<T>
}

type Sorting<T> = Exclude<keyof T, symbol> | null | {
  value: SortKey<T>
  name: string
}

type SortableNode = Exclude<React.ReactNode, object>
type UnsortableNode = Extract<React.ReactNode, object>

interface RowState {
  expanded: boolean | undefined
  setExpanded: (expanded: boolean) => void
}

interface LabelProps {
  tooltip?: React.ReactNode
  content: React.ReactNode
}

interface SortProps<T> {
  name: string | number
  value: SortKey<T>
}

interface CommonProps {
  width: string
  className?: string
  headerClassName?: string
  // TODO: controls for column layout on small screens, e.g. hide on mobile, full width on mobile, etc
  // TODO: Add these back in when we implement column visibility
  // visibility: 'always' | 'hidable' | 'hiddenByDefault' // Is the column always visible or can the user choose to hide this column? 'always' by default
  enabled: boolean // Should this column exist in this table? True by default. Used to exclude columns in certain tables without removing them from the column list
}

const defaults: CommonProps = {
  width: 'auto',
  className: '',
  headerClassName: '',
  // visibility: 'always',
  enabled: true,
}

export function normalizeColumnInput<T>(input: ColumnInput<T>, index: number): Column<T> {
  const {
    label = '',
    content,
    sortBy: sortByInput,
    ...rest
  } = input
  const getValue: ((item: T, s: RowState) => React.ReactNode) = typeof content === 'function'
    ? content
    : toAccessorFn(content)
  const sortName = getSortName(input)
  const sortValue = getSortValue(sortByInput, getValue as (item: T) => unknown)

  return {
    id: sortName ?? index,
    label: (label !== null && typeof label === 'object' && 'content' in label) ? label : { content: label },
    content: getValue,
    sortBy: sortValue && sortName !== null
      ? {
        name: sortName,
        value: sortValue,
      }
      : null,
    ...defaults,
    ...rest,
  }
}

function getSortName<T>(column: ColumnInput<T>): string | number | null {
  if (column.sortBy === null) return null
  if (typeof column.sortBy === 'object') {
    return column.sortBy.name
  }
  if (typeof column.sortBy === 'string' || typeof column.sortBy === 'number') {
    return column.sortBy
  }
  if (typeof column.content !== 'function') {
    return column.content as string | number
  }
  return null
}

function getSortValue<T>(sortBy: ColumnInput<T>['sortBy'], content: (item: T) => unknown): SortKey<T> | null {
  if (sortBy === null) return null
  if (typeof sortBy === 'string' || typeof sortBy === 'number') {
    return sortBy as SortKey<T>
  }
  if (typeof sortBy === 'object') {
    return sortBy.value ?? content
  }
  return content
}
