import {sorted} from 'utils/sorted'

import {Path} from './context'

export function sortedPaths(paths : Path[]) : Path[] {
  return sorted(paths, (a, b) => {
    return depth(a) - depth(b)
  })
}

function depth(path : Path) {
  return (path.href|| '').split('/').length
}
