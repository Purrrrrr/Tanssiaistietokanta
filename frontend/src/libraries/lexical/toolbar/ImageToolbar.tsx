import { useRef, useState } from 'react'
import { LexicalEditor } from 'lexical'

import type { FileOwner, FileOwningId } from 'types/files'
import { ToolbarHookReturn } from './types'

import { doUpload } from 'services/files'

import { Button } from 'libraries/ui'

import { useEditorT } from '../i18n'
import { INSERT_IMAGE_COMMAND } from '../plugins/ImagePlugin'
import { ImageIcon } from './icons'
import { ToolbarButton } from './ToolbarButton'

export interface ImageUploadConfig {
  owner: FileOwner
  owningId: FileOwningId
  path?: string
}

export function useImageToolbar(editor: LexicalEditor, imageUpload?: ImageUploadConfig): ToolbarHookReturn {
  const t = useEditorT('image')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isImageInsertMode, setIsImageInsertMode] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  function insertImageFromUrl() {
    const src = imageUrl.trim()
    if (!src) return
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src, altText: imageAlt.trim() })
    setImageUrl('')
    setImageAlt('')
    setIsImageInsertMode(false)
  }

  async function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !imageUpload) return
    setIsUploading(true)
    try {
      const uploaded = await doUpload({
        owner: imageUpload.owner,
        owningId: imageUpload.owningId,
        path: imageUpload.path,
        file,
        autoRename: true,
      })
      editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
        src: `/api/files/${uploaded._id}?download=true`,
        altText: file.name.replace(/\.[^.]+$/, ''),
      })
      setIsImageInsertMode(false)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return {
    button: (
      <ToolbarButton
        key="insertImage"
        onClick={() => { setIsImageInsertMode(true) }}
        active={isImageInsertMode}
        tooltip={t('insertImage')}>
        <ImageIcon />
      </ToolbarButton>
    ),
    floatingEditor: isImageInsertMode && (
      <div className="flex flex-wrap gap-2 items-center py-1 px-2 border-black border-t-1">
        <input
          className="flex-1 py-0.5 px-2 text-sm rounded border-gray-400 min-w-40 border-1"
          type="url"
          placeholder={t('urlPlaceholder')}
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') insertImageFromUrl(); if (e.key === 'Escape') setIsImageInsertMode(false) }}
        />
        <input
          className="py-0.5 px-2 w-32 text-sm rounded border-gray-400 border-1"
          type="text"
          placeholder={t('altText')}
          value={imageAlt}
          onChange={(e) => setImageAlt(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') insertImageFromUrl(); if (e.key === 'Escape') setIsImageInsertMode(false) }}
        />
        <Button minimal onClick={insertImageFromUrl}>{t('insertFromUrl')}</Button>
        {imageUpload && (
          <>
            <span className="text-sm text-gray-500">{t('or')}</span>
            <label className="py-0.5 px-2 text-xs bg-white rounded border-gray-400 cursor-pointer hover:bg-gray-50 border-1">
              {isUploading ? t('uploading') : t('uploadFile')}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={isUploading}
                onChange={handleImageFileChange}
              />
            </label>
          </>
        )}
        <Button minimal onClick={() => setIsImageInsertMode(false)}>{t('cancel')}</Button>
      </div>
    ),
  }
}
