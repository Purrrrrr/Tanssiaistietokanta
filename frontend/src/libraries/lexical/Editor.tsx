import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { HEADING, ORDERED_LIST, TEXT_FORMAT_TRANSFORMERS, UNORDERED_LIST } from '@lexical/markdown'
import classNames from 'classnames'

import { FieldComponentDisplayProps } from 'libraries/forms/types'

import { CssClass } from 'libraries/ui'

import { nodes } from './nodes'
import { AutoLinkPlugin, MATCHERS } from './plugins/AutoLinkPlugin'
import { CheckboxUIPlugin } from './plugins/CheckboxPlugin'
import { ImagePlugin } from './plugins/ImagePlugin'
import { LayoutPlugin } from './plugins/LayoutPlugin'
import { QRCodePlugin } from './plugins/QRCodePlugin'
import { SyncValuePlugin } from './plugins/SyncValuePlugin'
import { TablePlugin } from './plugins/TablePlugin'
import { theme } from './theme'
import ToolbarPlugin, { type ImageUploadConfig } from './Toolbar'
import type { MinifiedDocumentContent } from './utils/minify'
import { expand } from './utils/minify'

export interface EditorProps extends Partial<FieldComponentDisplayProps> {
  imageUpload?: ImageUploadConfig
  onChange?: (state: MinifiedDocumentContent) => unknown
  /** Latest minified editor state from the server.
   *  On first render this becomes the initial content.
   *  When the reference changes, the editor state is replaced (server wins). */
  value?: MinifiedDocumentContent | null
  className?: string
}

export function Editor({ inline, readOnly, imageUpload, onChange, value, className, ...rest }: EditorProps = {}) {
  const initialConfig = {
    namespace: 'MyEditor',
    theme,
    onError: (error: unknown) => console.error(error),
    // Expand minified value to SerializedEditorState for LexicalComposer's initial parse.
    // Subsequent changes are handled by SyncValuePlugin.
    editorState: value ? JSON.stringify(expand(value)) : undefined,
    nodes,
    readOnly: readOnly === true,
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div
        data-lexical-editor
        className={classNames(
          inline ? 'inline-flex' : 'flex',
          className,
          CssClass.inputBox,
          'flex-col bg-stone-100 p-[2px]',
        )}
      >
        <ToolbarPlugin imageUpload={imageUpload} />
        <div {...rest} className="grow overflow-auto bg-white p-2 **:focus:outline-none! lexical-content editable-lexical-content border-t-1 border-stone-400">
          <RichTextPlugin
            contentEditable={
              <ContentEditable />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
      </div>
      <HistoryPlugin />
      <ListPlugin />
      <CheckListPlugin />
      <LinkPlugin />
      <TablePlugin />
      <ImagePlugin />
      <LayoutPlugin />
      <QRCodePlugin />
      <CheckboxUIPlugin />
      <AutoLinkPlugin matchers={MATCHERS} />
      <MarkdownShortcutPlugin transformers={[
        HEADING, ORDERED_LIST, UNORDERED_LIST,
        ...TEXT_FORMAT_TRANSFORMERS,
      ]} />
      <SyncValuePlugin value={value} onChange={onChange} />
    </LexicalComposer>
  )
}
