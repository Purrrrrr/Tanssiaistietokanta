import 'react-markdown-editor-lite/lib/index.css'
import React from 'react'
import MdEditor, { PluginComponent, Plugins }  from 'react-markdown-editor-lite'

import {AnchorButton, Markdown} from 'libraries/ui'

import {FieldComponentProps} from '../types'

const defaultQRCode = '<QR value="https//..." size={50} />'
class QRCode extends PluginComponent<object> {
  // Define plugin name here, must be unique
  static pluginName = 'qrcode'
  // Define which place to be render, default is left, you can also use 'right'
  static align = 'left'

  render() {
    return (
      <span
        className="button"
        title="Insert QR Code"
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

  render() {
    return (
      <AnchorButton
        intent="primary"
        small
        target="_blank"
        href="https://github.com/akx/markdown-cheatsheet-fi/blob/master/Markdown-Ohje.md"
      >
       Ohjeita
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
}

export const MarkdownEditor = React.memo(function MarkdownEditor({value, onChange, inline, markdownOverrides, ...props} : MarkdownEditorProps) {
  return <MdEditor
    renderHTML={(text : string) => <Markdown options={{overrides: markdownOverrides}}>{text}</Markdown>}
    value={value ?? ''}
    onChange={({text}, e) => onChange(text, e)}
    {...props}
  />
})
