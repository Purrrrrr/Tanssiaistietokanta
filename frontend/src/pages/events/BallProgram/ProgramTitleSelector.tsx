import React from 'react'

import { Slide } from './useBallProgram'

interface ProgramTitleSelectorProps {
  program: Slide[]
  value: string
  onChange: (value: string) => unknown
}

export function ProgramTitleSelector({program, value, onChange}: ProgramTitleSelectorProps) {
  return <select value={value} onChange={(e) => onChange(e.target.value)}>
    {program.map((part, i) => <option key={i} value={part._id}>{getName(part)}</option>)}
  </select>
}

function getName(slide) {
  if (isHeader(slide)) return slide.name
  return `- ${slide.name}`
}

const isHeader = ({__typename}) => ['DanceSet', 'Event'].includes(__typename)
