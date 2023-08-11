import React from 'react'

import { SlideContent } from './useBallProgram'

interface ProgramTitleSelectorProps {
  program: SlideContent[]
  value: string
  onChange: (value: string) => unknown
}

export function ProgramTitleSelector({program, value, onChange}: ProgramTitleSelectorProps) {
  return <select value={value} onChange={(e) => onChange(e.target.value)}>
    {program.filter(isHeader).map((part, i) => <option key={i} value={part.id}>{part.title}</option>)}
  </select>
}

const isHeader = ({type}: SlideContent) => type && ['DanceSet', 'Event'].includes(type)
