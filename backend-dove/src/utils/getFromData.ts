export default function getFromData<T, R>(data: T | T[], mapper: (t: T) => R): R[] {
  if (Array.isArray(data)) {
    return data.map(mapper)
  }
  return [mapper(data)]
}
