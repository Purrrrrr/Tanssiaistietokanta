export interface Operation {
  op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test'
  from?: string
  path: string
  value?: unknown
}

export function escapePathToken(token: string): string {
  return token.replace(/~/g, '~0').replace(/\//g, '~1')
}
