import {Operation} from './types'

export function scopePatch(token: string, patch: Operation[]): Operation[] {
  return patch.map((op: Operation) => {
    const scoped : Operation = {
      ...op,
      path: scopePath(token, op.path),
    }
    if (op.from !== undefined) scoped.from = scopePath(token, op.from)

    return scoped
  })
}

export function scopePath(token: string, path: string): string {
  return `/${escapePathToken(token)}${path}`
}

export function unescapePathToken(token: string): string {
  return token.replace(/~1/g, '/').replace(/~0/g, '~')
}
export function escapePathToken(token: string): string {
  return token.replace(/~/g, '~0').replace(/\//g, '~1')
}
