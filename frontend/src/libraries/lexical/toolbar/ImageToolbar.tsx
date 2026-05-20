import { useRef, useState } from 'react'
import { $getNodeByKey, $isNodeSelection, LexicalEditor, NodeKey } from 'lexical'

import type { FileOwner, FileOwningId } from 'types/files'
import { ToolbarHookReturn } from './types'

import { doUpload } from 'services/files'

import { useEditorT } from '../i18n'
import { INSERT_IMAGE_COMMAND } from '../plugins/ImagePlugin'
import { $isImageNode } from '../plugins/nodes/ImageNode'
import { ImageIcon } from './icons'
import { ToolbarButton, ToolbarRow } from './widgets'

export interface ImageUploadConfig {
  owner: FileOwner
  owningId: FileOwningId
  path?: string
}

interface ImageInfo {
  nodeKey: NodeKey
  alt: string
  width?: number
}

export function useImageToolbar(editor: LexicalEditor, imageUpload?: ImageUploadConfig): ToolbarHookReturn {
  const t = useEditorT('image')
  const [isImageInsertMode, setIsImageInsertMode] = useState(false)
  const [selectedImage, setSelectedImage] = useState<ImageInfo | null>(null)

  function updateAltText(newAlt: string) {
    if (!selectedImage) return
    editor.update(() => {
      const node = $getNodeByKey(selectedImage.nodeKey)
      if ($isImageNode(node)) {
        node.setAltText(newAlt)
        setSelectedImage({ ...selectedImage, alt: newAlt })
      }
    })
  }
  function updateWidth(newWidth: string) {
    if (!selectedImage) return
    editor.update(() => {
      const node = $getNodeByKey(selectedImage.nodeKey)
      if ($isImageNode(node)) {
        const w = newWidth ? parseInt(newWidth) : undefined
        node.setWidth(w)
        setSelectedImage({ ...selectedImage, width: w })
      }
    })
  }

  function removeNode() {
    if (!selectedImage) return
    editor.update(() => {
      const node = $getNodeByKey(selectedImage.nodeKey)
      if ($isImageNode(node)) {
        node.remove()
      }
    })
  }

  return {
    button: (
      <ToolbarButton
        key="insertImage"
        onClick={() => { setIsImageInsertMode(true) }}
        active={isImageInsertMode}
        tooltip={t('insertImage')}
        icon={<ImageIcon />}
      />
    ),
    onUpdate: selection => {
      if ($isNodeSelection(selection)) {
        const node = selection.getNodes()[0]
        if ($isImageNode(node)) {
          setSelectedImage({
            nodeKey: node.getKey(),
            alt: node.getAltText(),
            width: node.getWidth(),
          })
          return
        }
      }
      setSelectedImage(null)
    },
    floatingEditor: <>
      {selectedImage && (
        <ToolbarRow title={t('imageProperties')}>
          <label htmlFor="qr-code-url-input" className="text-sm">{t('altText')}</label>
          <input
            id="qr-code-url-input"
            className="flex-1 py-0.5 px-2 text-sm rounded border-gray-400 border-1"
            type="text"
            value={selectedImage.alt}
            onChange={(e) => updateAltText(e.target.value)}
          />
          <label htmlFor="qr-code-url-input" className="text-sm">{t('width')}</label>
          <input
            id={`img-width`}
            className="py-0.5 px-2 w-16 text-xs rounded border-gray-400 border-1"
            type="number"
            min="1"
            placeholder="auto"
            value={selectedImage.width ?? ''}
            onChange={(e) => updateWidth(e.target.value)}
          />
          <ToolbarButton color="danger" onClick={removeNode} text={t('remove')} />
        </ToolbarRow>
      )}
      {isImageInsertMode && (<InsertImageToolbar editor={editor} imageUpload={imageUpload} onClose={() => setIsImageInsertMode(false)} />)}
    </>,
  }
}

function InsertImageToolbar({ editor, imageUpload, onClose }: {
  editor: LexicalEditor
  imageUpload?: ImageUploadConfig
  onClose: () => void
}) {
  const t = useEditorT('image')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  function insertImageFromUrl() {
    const src = imageUrl.trim()
    if (!src) return
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src, altText: imageAlt.trim() })
    setImageUrl('')
    setImageAlt('')
    onClose()
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
      onClose()
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return <ToolbarRow title={t('insertImage')}>
    <input
      className="flex-1 py-0.5 px-2 text-sm rounded border-gray-400 min-w-40 border-1"
      type="url"
      placeholder={t('urlPlaceholder')}
      value={imageUrl}
      onChange={(e) => setImageUrl(e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Enter') insertImageFromUrl(); if (e.key === 'Escape') onClose() }}
    />
    <input
      className="py-0.5 px-2 w-32 text-sm rounded border-gray-400 border-1"
      type="text"
      placeholder={t('altText')}
      value={imageAlt}
      onChange={(e) => setImageAlt(e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Enter') insertImageFromUrl(); if (e.key === 'Escape') onClose() }}
    />
    <ToolbarButton minimal onClick={insertImageFromUrl} text={t('insertFromUrl')} />
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
    <ToolbarButton onClick={() => onClose()} text={t('cancel')} />
  </ToolbarRow>
}
