export function range(count: number): number[] {
  return Array(count).fill(0).map((_, index) => index)
}

export const colors = ['none', 'primary', 'success', 'danger', 'warning'] as const
