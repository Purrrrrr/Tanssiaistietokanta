import { startSlideId } from 'components/event/EventSlide'

import { Event } from './useBallProgramQuery'

interface ProgramTitleSelectorProps {
  program: Event['program']
  value: string
  onChange: (value: string) => unknown
}

export function ProgramTitleSelector({program, value, onChange}: ProgramTitleSelectorProps) {
  return <select value={value} onChange={(e) => onChange(e.target.value)}>
    <option value={startSlideId}>{program.introductions.title}</option>
    {program.danceSets.map(danceSet =>
      <option key={danceSet._id} value={danceSet._id}>{danceSet.title}</option>
    )}
  </select>
}
