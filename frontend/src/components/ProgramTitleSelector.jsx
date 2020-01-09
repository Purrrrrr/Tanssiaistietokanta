import React from 'react';

export function ProgramTitleSelector({program, value, onChange}) {
  return <select value={value} onChange={(e) => onChange(e.target.value)}>
    {program.map((part,i) => 
      part.type === 'HEADER' && <option key={i} value={i}>{part.name}</option>)}
  </select>;
}
