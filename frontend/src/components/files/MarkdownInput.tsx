import { MarkdownToJSX, parser, RuleType } from 'markdown-to-jsx/react'
import { useEffect, useRef } from 'react'

import { ID } from 'backend/types'

import { useMarkFileUsage } from 'services/files'

import {
  MarkdownInput as MarkdownInputOriginal,
  type MarkdownInputProps as MarkdownInputPropsOriginal,
} from 'libraries/formsV2/components/inputs'

import { UploadProgressList } from './UploadProgres'
import { useUploadQueue } from './useUploadQueue'

export interface MarkdownInputProps extends Omit<MarkdownInputPropsOriginal, 'onImageUpload'> {
  fileRoot: string
  filePath?: string
}

export function MarkdownInput({ fileRoot, filePath, ...props }: MarkdownInputProps) {
  const [doUpload, uploads] = useUploadQueue(fileRoot, filePath)
  const [markUsages] = useMarkFileUsage()
  const onImageUpload = async (file: File) => {
    const result = await doUpload(file, undefined, true)
    return getMarkdownUrl(result._id)
  }
  const ast = parser(props.value ?? '')
  const imageIds = getImages(ast).map(getUploadedFileId).filter(id => id !== null)
  const previousIds = useRef<string[]>([])

  useEffect(
    () => {
      const deleted = previousIds.current.filter(id => !imageIds.includes(id))
      const newUsed = imageIds.filter(id => !previousIds.current.includes(id))
      const usages = [
        ...deleted.map(_id => ({ _id, unused: true })),
        ...newUsed.map(_id => ({ _id, unused: false })),
      ]
      if (usages.length > 0) {
        markUsages({ usages })
      }
      previousIds.current = imageIds
    },
    [imageIds, markUsages],
  )

  return <>
    <MarkdownInputOriginal
      {...props}
      markdownOverrides={{ img: Image }}
      onImageUpload={onImageUpload}
      imageAccept="image/*"
    />
    <UploadProgressList uploads={uploads} />
  </>
}

function getImages(ast: MarkdownToJSX.ASTNode[]): string[] {
  return ast.flatMap(node => {
    if (node.type === RuleType.image) {
      return [node.target]
    }
    if (node.type === RuleType.table) {
      return getImages([
        ...(node.cells.flat(2) ?? []),
        ...(node.header.flat(2) ?? []),
      ])
    }
    if ('items' in node) {
      return getImages(node.items.flat() ?? [])
    }
    if ('children' in node) {
      return getImages(node.children ?? [])
    }
    return []
  })
}

function Image(props: React.ComponentProps<'img'>) {
  const id = getUploadedFileId(props.src ?? '')

  /* eslint-disable jsx-a11y/alt-text */
  return id
    ? <img {...props} src={getDownloadUrl(id)} />
    : <img {...props} />
  /* eslint-enable jsx-a11y/alt-text */
}

function getUploadedFileId(url: string): ID | null {
  if (url.startsWith('!')) {
    return url.slice(1)
  }
  return null
}

function getMarkdownUrl(id: ID): string {
  return `!${id}`
}

function getDownloadUrl(id: ID): string {
  return `/api/files/${id}?download=true`
}
