import 'react-markdown-editor-lite/lib/index.css'
import { MarkdownToJSX } from 'markdown-to-jsx/react'
import React from 'react'
import MdEditor, { Plugins } from 'react-markdown-editor-lite'

import type { FieldInputComponent, FieldInputComponentProps } from './types'

import { AnchorButton, Markdown } from 'libraries/ui'

import { useFormTranslation } from '../../localization'

import './MarkdownInput.css'

const defaultQRCode = '<QR title="..." value="https//..." size="250" font-size="100" />'
function QRCode({ editor }) {
  const insertQRCode = useFormTranslation('markdownEditor.insertQRCode')
  return (
    <button
      className="button"
      title={insertQRCode}
      onClick={() => editor.insertText(defaultQRCode)}
    >
      QR
    </button>
  )
}
QRCode.align = 'left'
QRCode.pluginName = 'qrcode'

function HelpLink() {
  return (
    <AnchorButton
      color="primary"
      className="p-2"
      target="_blank"
      href={useFormTranslation('markdownEditor.helpUrl')}
    >
      {useFormTranslation('markdownEditor.help')}
    </AnchorButton>
  )
}
HelpLink.align = 'right'
HelpLink.pluginName = 'helplink'

function ConditionalImagePlugin(props) {
  if (!props.editor.props.onImageUpload) return null
  return <Plugins.Image {...props} />
}
ConditionalImagePlugin.align = 'left'
ConditionalImagePlugin.pluginName = 'image'

const pluginList = [
  Plugins.Header, Plugins.FontBold, Plugins.FontItalic,
  Plugins.FontStrikethrough, Plugins.ListUnordered, Plugins.ListOrdered,
  Plugins.BlockWrap, Plugins.BlockCodeInline, Plugins.BlockCodeBlock, ConditionalImagePlugin, Plugins.Table,
  Plugins.Link, Plugins.Logger, Plugins.ModeToggle, Plugins.FullScreen,
  QRCode,
  HelpLink,
]
MdEditor.unuseAll()
pluginList.forEach(plugin => MdEditor.use(plugin, {}))

export interface MarkdownInputProps extends FieldInputComponentProps<string>, Partial<Pick<React.ComponentProps<typeof MdEditor>, 'onImageUpload' | 'imageAccept'>> {
  style?: React.CSSProperties
  className?: string
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void
  markdownOverrides?: MarkdownToJSX.Overrides
  noPreview?: boolean
}

const MarkdownInput: FieldInputComponent<string, MarkdownInputProps> = React.memo(
  function MarkdownEditor({ value, onChange, className, inline: _ignored, markdownOverrides, noPreview, ...props }: MarkdownInputProps) {
    if (props.readOnly) {
      return <div className="markdown-content custom-html-style p-3 border-1 border-gray-300 min-h-8">
        <Markdown options={{ overrides: markdownOverrides }}>{value ?? ''}</Markdown>
      </div>
    }
    return <MdEditor
      className={className}
      renderHTML={(text: string) => <Markdown options={{ overrides: markdownOverrides }}>{text}</Markdown>}
      value={value ?? ''}
      onChange={({ text }) => onChange(text)}
      {...props}
      view={noPreview ? { menu: true, md: true, html: false } : undefined}
      canView={noPreview ? { menu: true, md: true, html: false, both: false, fullScreen: true, hideMenu: true } : undefined}
      allowPasteImage={props.onImageUpload !== undefined}
    />
  },
)

export default MarkdownInput
