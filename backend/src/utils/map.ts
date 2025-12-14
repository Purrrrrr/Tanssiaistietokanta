export function map<T, R>(data: T | T[], func: (t: T) => R): R | R[] {
  return Array.isArray(data)
    ? data.map(func)
    : func(data)
}

export function mapAsync<T, R>(data: T | T[], func: (t: T) => Promise<R> | R): Promise<R | R[]> {
  return Array.isArray(data)
    ? Promise.all(data.map(func))
    : Promise.resolve(func(data))
}
