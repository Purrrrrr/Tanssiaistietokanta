import React from 'react'
import classNames from 'classnames'

import './PrintTable.sass'

interface PrintTableProps {
  children: any,
  headings?: string[],
  className?: string
}

export function PrintTable({children, headings, className} : PrintTableProps) {
  return <table className={classNames(className, 'printTable')}>
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
