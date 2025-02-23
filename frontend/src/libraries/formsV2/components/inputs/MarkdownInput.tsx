import 'react-markdown-editor-lite/lib/index.css'
import React from 'react'
import MdEditor, { Plugins }  from 'react-markdown-editor-lite'
import { MarkdownToJSX } from 'markdown-to-jsx'

import {AnchorButton, Markdown} from 'libraries/ui'

import { useFormTranslation } from '../../localization'
import type { FieldInputComponent, FieldInputComponentProps } from './types'

const defaultQRCode = '<QR title="..." value="https//..." size={250} />'
function QRCode({ editor }) {
  const insertQRCode = useFormTranslation('markdownEditor.insertQRCode')
  return (
    <span
      className="button"
      title={insertQRCode}
      onClick={() => editor.insertText(defaultQRCode)}
    >
      QR
    </span>
  )
}
QRCode.align = 'left'
QRCode.pluginName = 'qrcode'

function HelpLink() {
  return (
    <AnchorButton
      intent="primary"
      small
      target="_blank"
      href={useFormTranslation('markdownEditor.helpUrl')}
    >
      {useFormTranslation('markdownEditor.help')}
    </AnchorButton>
  )
}
HelpLink.align = 'right'
HelpLink.pluginName = 'helplink'

const pluginList = [
  Plugins.Header, Plugins.FontBold, Plugins.FontItalic, Plugins.FontUnderline,
  Plugins.FontStrikethrough, Plugins.ListUnordered, Plugins.ListOrdered,
  Plugins.BlockWrap, Plugins.BlockCodeInline, Plugins.BlockCodeBlock, Plugins.Table,
  Plugins.Link, Plugins.Logger, Plugins.ModeToggle, Plugins.FullScreen,
  QRCode,
  HelpLink,
]
MdEditor.unuseAll()
pluginList.forEach(plugin => MdEditor.use(plugin, {}))

export interface MarkdownEditorProps extends FieldInputComponentProps<string> {
  style?: React.CSSProperties
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void
  markdownOverrides?: MarkdownToJSX.Overrides
  noPreview?: boolean
}

export const MarkdownInput : FieldInputComponent<string, MarkdownEditorProps> = React.memo(
  function MarkdownEditor({value, onChange, inline: _ignored, markdownOverrides, noPreview, ...props} : MarkdownEditorProps) {
    return <MdEditor
      renderHTML={(text : string) => <Markdown options={{overrides: markdownOverrides}}>{text}</Markdown>}
      value={value ?? ''}
      onChange={({text}) => onChange(text)}
      {...props}
      view={noPreview ? {menu: true, md: true, html: false} : undefined}
      canView={noPreview ? {menu: true, md: true, html: false, both: false, fullScreen: true, hideMenu: true} : undefined}
    />
  }
)
