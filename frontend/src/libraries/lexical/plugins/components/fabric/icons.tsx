export function RectangleIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="transparent" stroke="currentColor" aria-hidden="true">
      <rect x="1" y="3" width="14" height="10" rx="1" />
    </svg>
  )
}
export function EllipseIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="transparent" stroke="currentColor" aria-hidden="true">
      <ellipse cx="8" cy="8" rx="7" ry="5" />
    </svg>
  )
}
export function CircleIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="transparent" stroke="currentColor" aria-hidden="true">
      <circle cx="8" cy="8" r="7" />
    </svg>
  )
}
export function TriangleIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="transparent" stroke="currentColor" aria-hidden="true">
      <polygon points="8,1 15,14 1,14" />
    </svg>
  )
}
export function PentagonIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="transparent" stroke="currentColor" aria-hidden="true">
      <polygon points="8,1 15,6 12,14 4,14 1,6" />
    </svg>
  )
}
export function HexagonIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="transparent" stroke="currentColor" aria-hidden="true">
      <polygon points="8,1 14,4 14,11 8,14 2,11 2,4" />
    </svg>
  )
}
export function StarIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="transparent" stroke="currentColor" aria-hidden="true">
      <polygon points="8,1 10,6 15,6 11,9 12,14 8,11 4,14 5,9 1,6 6,6" />
    </svg>
  )
}
export function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="transparent" stroke="currentColor" aria-hidden="true">
      <line x1="2" y1="8" x2="14" y2="8" />
      <polygon points="12,6 14,8 12,10" />
    </svg>
  )
}

export { BringForward as BringToTopIcon, Edit as DrawIcon, PolygonFilter as EditPolygon, SendBackward as SendToBottomIcon } from '@blueprintjs/icons'
