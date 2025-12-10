import { MarkdownToJSX, parser, RuleType } from 'markdown-to-jsx/react'
import { useEffect, useRef } from 'react'

import { ID } from 'backend/types'

import { useDeleteFile } from 'services/files'

import {
  MarkdownInput as MarkdownInputOriginal,
  MarkdownInputProps as MarkdownInputPropsOriginal,
} from 'libraries/formsV2/components/inputs/MarkdownInput'

import { UploadProgressList } from './UploadProgres'
import { useUploadQueue } from './useUploadQueue'

export interface MarkdownInputProps extends Omit<MarkdownInputPropsOriginal, 'onImageUpload'> {
  fileRoot: string
  filePath?: string
}

export function MarkdownInput({ fileRoot, filePath, ...props }: MarkdownInputProps) {
  const [doUpload, uploads] = useUploadQueue(fileRoot, filePath)
  const [deleteFile] = useDeleteFile({ onError: () => { /* Do nothing, probably already deleted */ } })
  const onImageUpload = async (file: File) => {
    const result = await doUpload(file, undefined, true)
    return getMarkdownUrl(result._id)
  }
  const ast = parser(props.value ?? '')
  console.log(ast)
  const imageIds = getImages(ast).map(getUploadedFileId).filter(id => id !== null)
  const previousIds = useRef<string[]>([])

  useEffect(
    () => {
      console.log(imageIds, previousIds.current)
      const deleted = previousIds.current.filter(id => !imageIds.includes(id))
      if (deleted.length > 0) console.log('deleting files', deleted)
      deleted.forEach(id => deleteFile({ id }))
      previousIds.current = imageIds
    },
    [imageIds, deleteFile],
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
