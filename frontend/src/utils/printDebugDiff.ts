/** Debug utility to print differences between two objects, including nested structures. */
export function printDebugDiff(obj1: unknown, obj2: unknown, path = ''): void {
  if (typeof obj1 !== typeof obj2) {
    console.log(`Type mismatch at ${path}:`, obj1, obj2)
    return
  }
  if (typeof obj1 === 'object' && obj1 != null && obj2 != null) {
    const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)])
    for (const key of keys) {
      if (!(key in (obj1 as Record<string, unknown>))) {
        console.log(`Key ${key} missing in obj1 at ${path}`)
        continue
      }
      if (!(key in (obj2 as Record<string, unknown>))) {
        console.log(`Key ${key} missing in obj2 at ${path}`)
        continue
      }
      printDebugDiff((obj1 as Record<string, unknown>)[key], (obj2 as Record<string, unknown>)[key], `${path}/${key}`)
    }
  } else if (obj1 !== obj2) {
    console.log(`Value mismatch at ${path}:`, obj1, obj2)
  }
}
