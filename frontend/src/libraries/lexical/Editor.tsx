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

export interface EditorProps {
  imageUpload?: ImageUploadConfig
  onChange?: (state: MinifiedDocumentContent) => void
  /** Latest minified editor state from the server.
   *  On first render this becomes the initial content.
   *  When the reference changes, the editor state is replaced (server wins). */
  value?: MinifiedDocumentContent | null
  className?: string
}

export function Editor({ imageUpload, onChange, value, className }: EditorProps = {}) {
  const initialConfig = {
    namespace: 'MyEditor',
    theme,
    onError: (error: unknown) => console.error(error),
    // Expand minified value to SerializedEditorState for LexicalComposer's initial parse.
    // Subsequent changes are handled by SyncValuePlugin.
    editorState: value ? JSON.stringify(expand(value)) : undefined,
    nodes,
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div data-lexical-editor className={`flex flex-col bg-stone-100 min-w-200 ${CssClass.inputBox} p-[2px] ${className}`}>
        <ToolbarPlugin imageUpload={imageUpload} />
        <div className="overflow-auto bg-white p-2 **:focus:outline-none! markdown-content border-t-1 border-stone-400">
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
