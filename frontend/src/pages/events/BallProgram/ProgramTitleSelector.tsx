import React from 'react'

import { Slide } from './useBallProgram'

interface ProgramTitleSelectorProps {
  program: Slide[]
  value: string
  onChange: (value: string) => unknown
}

export function ProgramTitleSelector({program, value, onChange}: ProgramTitleSelectorProps) {
  return <select value={value} onChange={(e) => onChange(e.target.value)}>
    {program.filter(isHeader).map((part, i) => <option key={i} value={part.id}>{part.slide.title}</option>)}
  </select>
}

const isHeader = ({slide}) => ['DanceSet', 'Event'].includes(slide.type)
