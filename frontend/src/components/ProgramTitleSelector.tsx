import React from 'react'

interface ProgramTitleSelectorProps {
  program: {
    __typename: string
    name: string
  }[]
  value: number
  onChange: (value: number) => unknown
}

export function ProgramTitleSelector({program, value, onChange}: ProgramTitleSelectorProps) {
  return <select value={value} onChange={(e) => onChange(parseInt(e.target.value))}>
    {program.map((part, i) =>
      isHeader(part) && <option key={i} value={i}>{part.name}</option>)}
  </select>
}

const isHeader = ({__typename}) => ['DanceSet', 'Event'].includes(__typename)
