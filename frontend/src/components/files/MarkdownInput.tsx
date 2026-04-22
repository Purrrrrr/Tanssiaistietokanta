import { useEffect, useRef } from 'react'

import { ID } from 'types'
import { FileOwner, FileOwningId } from 'types/files'

import { useMarkFileUsage } from 'services/files'

import { FieldInputComponentProps } from 'libraries/formsV2'

import { UploadProgressList } from './UploadProgres'
import { useUploadQueue } from './useUploadQueue'

type MarkdownInputPropsOriginal = FieldInputComponentProps<string>

export interface MarkdownInputProps extends Omit<MarkdownInputPropsOriginal, 'onImageUpload'> {
  fileOwner: FileOwner
  fileOwningId: FileOwningId
  filePath?: string
}

export function MarkdownInput({ fileOwner, fileOwningId, filePath, ...props }: MarkdownInputProps) {
  const [doUpload, uploads] = useUploadQueue(fileOwner, fileOwningId, filePath)
  const [markUsages] = useMarkFileUsage()
  const onImageUpload = async (file: File) => {
    const result = await doUpload(file, undefined, true)
    return getMarkdownUrl(result._id)
  }
  const imageIds = getImages(props.value).map(getUploadedFileId).filter(id => id !== null)
  const previousIds = useRef<string[]>([])

  useEffect(
    () => {
      if (props.readOnly) {
        return
      }
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
    [imageIds, markUsages, props.readOnly],
  )

  return <>
    {/* <MarkdownInputOriginal */}
    {/*   {...props} */}
    {/*   markdownOverrides={{ img: Image }} */}
    {/*   onImageUpload={onImageUpload} */}
    {/*   imageAccept="image/*" */}
    {/* /> */}
    <UploadProgressList uploads={uploads} />
  </>
}

function getImages(value: string | null | undefined): string[] {
  return []
}

function Image(props: React.ComponentProps<'img'>) {
  const id = getUploadedFileId(props.src ?? '')

  /* eslint-disable jsx-a11y/alt-text */
  return id
    ? <img {...props} src={getDownloadUrl(id)} />
    : <img {...props} src={props.src === '' ? '/404.png' : props.src} />
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
