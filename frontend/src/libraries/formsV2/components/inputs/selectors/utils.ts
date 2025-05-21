export function acceptNulls<T>(
  itemToString: (item: T) => string,
  nullDefault: string = '',
): ((item: T | null) => string) {
  return item => item ? itemToString(item) : nullDefault
}

export function preventDownshiftDefaultWhen<T>(condition: (event: T) => boolean) {
  return (e: T) => {
    if (condition(e)) preventDownshiftDefault(e)
  }
}

export function preventDownshiftDefault<T>(event: T) {
  (event as unknown as Record<string, boolean>).preventDownshiftDefault = true
}
