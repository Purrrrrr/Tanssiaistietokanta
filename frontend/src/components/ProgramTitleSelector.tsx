import React from 'react'

export function ProgramTitleSelector({program, value, onChange}) {
  return <select value={value} onChange={(e) => onChange(e.target.value)}>
    {program.map((part, i) =>
      isHeader(part) && <option key={i} value={i}>{part.name}</option>)}
  </select>
}

const isHeader = ({__typename}) => ['DanceSet', 'Event'].includes(__typename)
