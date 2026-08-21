export function range(count: number): number[] {
  return Array(count).fill(0).map((_, index) => index)
}
