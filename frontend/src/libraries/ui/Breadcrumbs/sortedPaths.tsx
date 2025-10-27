import { sortedBy } from 'utils/sorted'

import { Path } from './context'

export function sortedPaths(paths: Path[]): Path[] {
  return sortedBy(paths, depth)
}

function depth(path: Path) {
  return (path.href || '').split('/').length
}
