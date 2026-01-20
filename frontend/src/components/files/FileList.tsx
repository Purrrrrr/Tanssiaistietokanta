import { lazy } from 'react'

import { useRight } from 'libraries/access-control'

import type { FileListProps } from './FileListImpl'

export type { FileListProps }

const FileListLazy = lazy(() => import('./FileListImpl'))

export function FileList(props: FileListProps) {
  if (!useRight('files:read')) {
    return null
  }

  return <FileListLazy {...props} />
}
