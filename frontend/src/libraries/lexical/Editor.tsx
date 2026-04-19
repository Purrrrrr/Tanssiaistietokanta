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
import type { MinifiedEditorState } from './utils/minify'
import { expand } from './utils/minify'

export interface EditorProps {
  imageUpload?: ImageUploadConfig
  onChange?: (state: MinifiedEditorState) => void
  /** Latest minified editor state from the server.
   *  On first render this becomes the initial content.
   *  When the reference changes, the editor state is replaced (server wins). */
  value?: MinifiedEditorState | null
}

export function Editor({ imageUpload, onChange, value }: EditorProps = {}) {
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
      <div className="border-1 border-black min-w-200 bg-white">
        <ToolbarPlugin imageUpload={imageUpload} />
        <div className="p-2 border-t-1 border-black **:focus:outline-none! markdown-content">
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
