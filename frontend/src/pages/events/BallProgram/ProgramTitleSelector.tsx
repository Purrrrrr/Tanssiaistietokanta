import React from 'react'

import { Slide } from './useBallProgram'

interface ProgramTitleSelectorProps {
  program: Slide[]
  value: string
  onChange: (value: string) => unknown
}

export function ProgramTitleSelector({program, value, onChange}: ProgramTitleSelectorProps) {
  return <select value={value} onChange={(e) => onChange(e.target.value)}>
    {program.filter(isHeader).map((part, i) => <option key={i} value={part._id}>{part.name}</option>)}
  </select>
}

const isHeader = ({__typename}) => ['DanceSet', 'Event'].includes(__typename)
