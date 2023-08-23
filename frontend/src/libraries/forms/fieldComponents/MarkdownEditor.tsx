import 'react-markdown-editor-lite/lib/index.css'
import React from 'react'
import MdEditor, { PluginComponent, Plugins }  from 'react-markdown-editor-lite'

import {AnchorButton, Markdown} from 'libraries/ui'

import { FormMetadataContext, useFormStrings } from '../formContext'
import { FormStrings } from '../strings'
import {FieldComponentProps} from '../types'

const defaultQRCode = '<QR value="https//..." size={50} />'
class QRCode extends PluginComponent<object> {
  // Define plugin name here, must be unique
  static pluginName = 'qrcode'
  // Define which place to be render, default is left, you can also use 'right'
  static align = 'left'
  static contextType = FormMetadataContext

  render() {
    const texts = (this.context?.getStrings?.() as FormStrings | undefined)?.markdownEditor ?? {
      insertQRCode: '',
    }
    return (
      <span
        className="button"
        title={texts.insertQRCode}
        onClick={() => this.editor.insertText(defaultQRCode)}
      >
        QR
      </span>
    )
  }
}

class HelpLink extends PluginComponent<object> {
  // Define plugin name here, must be unique
  static pluginName = 'helplink'
  // Define which place to be render, default is left, you can also use 'right'
  static align = 'right'
  static contextType = FormMetadataContext

  render() {
    const texts = (this.context?.getStrings?.() as FormStrings | undefined)?.markdownEditor ?? {
      helpUrl: '',
      help: '',
    }
    return (
      <AnchorButton
        intent="primary"
        small
        target="_blank"
        href={texts.helpUrl}
      >
        {texts.help}
      </AnchorButton>
    )
  }
}

MdEditor.use(QRCode, {})
MdEditor.use(HelpLink, {})
MdEditor.unuse(Plugins.Image)

interface MarkdownEditorProps extends FieldComponentProps<string, HTMLTextAreaElement> {
  style?: React.CSSProperties
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void
  markdownOverrides?: Record<string, unknown>
  noPreview?: boolean
}

export const MarkdownEditor = React.memo(function MarkdownEditor({value, onChange, inline, markdownOverrides, noPreview, ...props} : MarkdownEditorProps) {
  const strings = useFormStrings().markdownEditor
  return <MdEditor
    config={{strings}}
    renderHTML={(text : string) => <Markdown options={{overrides: markdownOverrides}}>{text}</Markdown>}
    value={value ?? ''}
    onChange={({text}, e) => onChange(text, e)}
    {...props}
    view={noPreview ? {menu: true, md: true, html: false} : undefined}
    canView={noPreview ? {menu: true, md: true, html: false, both: false, fullScreen: true, hideMenu: true} : undefined}
  />
})
