export interface ProjectionMargins {
  top: number
  bottom: number
  left: number
  right: number
}

export const projectionMarginSides = ['top', 'bottom', 'left', 'right'] as const
export type ProjectionMarginSide = typeof projectionMarginSides[number]

export const defaultProjectionMargins: ProjectionMargins = { top: 0, bottom: 0, left: 0, right: 0 }
export const projectionMarginsStorageKey = 'presentation:margins'

const maximumCombinedMargin = 80
const marginStep = 5
const oppositeSide: Record<ProjectionMarginSide, ProjectionMarginSide> = {
  top: 'bottom', bottom: 'top', left: 'right', right: 'left',
}

function normalizeMargin(value: unknown, maximum = maximumCombinedMargin): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0
  return Math.min(maximum, Math.max(0, Math.floor(value / marginStep) * marginStep))
}

export function normalizeProjectionMargins(value: unknown): ProjectionMargins {
  if (typeof value !== 'object' || value === null) return { ...defaultProjectionMargins }
  const stored = value as Partial<ProjectionMargins>
  const top = normalizeMargin(stored.top)
  const left = normalizeMargin(stored.left)
  return {
    top,
    bottom: normalizeMargin(stored.bottom, maximumCombinedMargin - top),
    left,
    right: normalizeMargin(stored.right, maximumCombinedMargin - left),
  }
}

export function getProjectionMarginOptions(margins: ProjectionMargins, side: ProjectionMarginSide): number[] {
  const maximum = maximumCombinedMargin - margins[oppositeSide[side]]
  return Array.from({ length: maximum / marginStep + 1 }, (_, index) => index * marginStep)
}

export function changeProjectionMargin(margins: ProjectionMargins, side: ProjectionMarginSide, value: number): ProjectionMargins {
  return {
    ...margins,
    [side]: normalizeMargin(value, maximumCombinedMargin - margins[oppositeSide[side]]),
  }
}
