export function UnorderedListIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
      <circle cx="2" cy="4" r="1.5" />
      <rect x="5" y="3" width="10" height="2" rx="1" />
      <circle cx="2" cy="8" r="1.5" />
      <rect x="5" y="7" width="10" height="2" rx="1" />
      <circle cx="2" cy="12" r="1.5" />
      <rect x="5" y="11" width="10" height="2" rx="1" />
    </svg>
  )
}

export function OrderedListIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
      <text x="0" y="5" fontSize="5" fontFamily="monospace">1.</text>
      <rect x="5" y="3" width="10" height="2" rx="1" />
      <text x="0" y="9" fontSize="5" fontFamily="monospace">2.</text>
      <rect x="5" y="7" width="10" height="2" rx="1" />
      <text x="0" y="13" fontSize="5" fontFamily="monospace">3.</text>
      <rect x="5" y="11" width="10" height="2" rx="1" />
    </svg>
  )
}

export function CheckListIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
      <rect x="0.5" y="2.5" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1" fill="none" />
      <polyline points="1,4 2,5 3.5,3" stroke="currentColor" strokeWidth="1" fill="none" />
      <rect x="5" y="3" width="10" height="2" rx="1" />
      <rect x="0.5" y="6.5" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1" fill="none" />
      <rect x="5" y="7" width="10" height="2" rx="1" />
      <rect x="0.5" y="10.5" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1" fill="none" />
      <rect x="5" y="11" width="10" height="2" rx="1" />
    </svg>
  )
}

export function QRCodeIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
      {/* top-left finder */}
      <rect x="1" y="1" width="5" height="5" rx="0.5" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="2.5" y="2.5" width="2" height="2" />
      {/* top-right finder */}
      <rect x="10" y="1" width="5" height="5" rx="0.5" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="11.5" y="2.5" width="2" height="2" />
      {/* bottom-left finder */}
      <rect x="1" y="10" width="5" height="5" rx="0.5" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="2.5" y="11.5" width="2" height="2" />
      {/* data dots */}
      <rect x="8" y="8" width="1.5" height="1.5" />
      <rect x="10.5" y="8" width="1.5" height="1.5" />
      <rect x="13" y="8" width="1.5" height="1.5" />
      <rect x="8" y="10.5" width="1.5" height="1.5" />
      <rect x="8" y="13" width="1.5" height="1.5" />
      <rect x="10.5" y="13" width="1.5" height="1.5" />
      <rect x="13" y="13" width="1.5" height="1.5" />
    </svg>
  )
}

export function TableIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
      <rect x="1" y="1" width="14" height="14" rx="1" fill="none" stroke="currentColor" strokeWidth="1" />
      {/* header row bottom border */}
      <line x1="1" y1="5" x2="15" y2="5" stroke="currentColor" strokeWidth="1" />
      {/* middle row bottom border */}
      <line x1="1" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="1" />
      {/* column divider */}
      <line x1="6" y1="1" x2="6" y2="15" stroke="currentColor" strokeWidth="1" />
      {/* second column divider */}
      <line x1="11" y1="1" x2="11" y2="15" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

export function ImageIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
      <rect x="1" y="2" width="14" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="5" cy="6" r="1.5" />
      <polyline points="1,11 5,7 8,10 11,7 15,11" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  )
}
