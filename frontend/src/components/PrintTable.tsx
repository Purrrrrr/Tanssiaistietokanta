import classNames from 'classnames'

import './PrintTable.css'

interface PrintTableProps {
  children: React.ReactNode
  headings?: string[]
  className?: string
}

export function PrintTable({ children, headings, className }: PrintTableProps) {
  return <table className={classNames(className, 'printTable table-fixed border-collapse')}>
    {headings && <thead>
      <tr>
        {headings.map((heading, i) => <th key={i}>{heading}</th>)}
      </tr>
    </thead>}
    <tbody>
      {children}
    </tbody>
  </table>
}
