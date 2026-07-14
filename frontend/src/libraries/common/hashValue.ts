import { hashString } from './hashString'

export function hashValue(data: unknown): Promise<string> {
  return hashString(JSON.stringify(data, deterministicReplacer))
}

const deterministicReplacer = (_: string, v: unknown) => {
  return typeof v !== 'object' || v === null || Array.isArray(v)
    ? v
    : Object.fromEntries(
      Object.entries(v).sort(([ka], [kb]) => ka < kb ? -1 : ka > kb ? 1 : 0),
    )
}
