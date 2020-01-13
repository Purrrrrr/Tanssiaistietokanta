import React from 'react';

import './PrintTable.sass'

export function PrintTable({children, headings, className}) {
  return <table className={(className ? className + " " : "") + "printTable"}>
    {headings && <thead>
      <tr>
        {headings.map((heading, i) => <th key={i}>{heading}</th>)}
      </tr>
    </thead>}
    <tbody>
      {children}
    </tbody>
    </table>;
}
