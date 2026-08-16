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
  content: (item: T, state: RowState) => SortableNode
  sortName: string | null
  sortBy?: SortKey<T> | null
} | {
  content: (item: T, state: RowState) => UnsortableNode
  sortName: null
  sortBy?: never
} | {
  content: (item: T, state: RowState) => UnsortableNode
  sortName: string
  sortBy: SortKey<T> | null
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
  sortName: string
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
    sortName,
    sortBy,
    ...rest
  } = input

  return {
    id: sortName ?? index,
    label: (label !== null && typeof label === 'object' && 'content' in label) ? label : { content: label },
    content,
    sortBy: sortName === null
      ? null
      : {
        sortName: sortName,
        value: sortBy ?? (content as (item: T) => unknown),
      },
    ...defaults,
    ...rest,
  }
}
