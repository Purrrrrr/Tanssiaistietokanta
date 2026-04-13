import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { LinkNode } from '@lexical/link'
import { ListItemNode, ListNode } from '@lexical/list'
import { HeadingNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import type { SerializedEditorState } from 'lexical'
import { $getRoot } from 'lexical'
import { minify } from 'lexical-minifier'

import type { FileOwner, FileOwningId } from 'types/files'

import { CheckboxUIPlugin, ChecklistItemNode } from './plugins/CheckboxPlugin'
import { ImagePlugin } from './plugins/ImagePlugin'
import { LayoutPlugin } from './plugins/LayoutPlugin'
import { ImageNode } from './plugins/nodes/ImageNode'
import { LayoutContainerNode } from './plugins/nodes/LayoutContainerNode'
import { LayoutItemNode } from './plugins/nodes/LayoutItemNode'
import { QRCodeNode } from './plugins/nodes/QRCodeNode'
import { QRCodePlugin } from './plugins/QRCodePlugin'
import { EXTERNAL_UPDATE_TAG, SyncValuePlugin } from './plugins/SyncValuePlugin'
import { TablePlugin } from './plugins/TablePlugin'
import ToolbarPlugin from './Toolbar'

export type { SerializedEditorState }

export interface ImageUploadConfig {
  owner: FileOwner
  owningId: FileOwningId
  path?: string
}

export interface EditorProps {
  imageUpload?: ImageUploadConfig
  onChange?: (state: SerializedEditorState) => void
  /** Latest serialized editor state from the server.
   *  On first render this becomes the initial content.
   *  When the reference changes, the editor state is replaced (server wins). */
  value?: SerializedEditorState | null
}

const theme = {
  // TODO
  // paragraph: 'my-2',
  // quote: 'editor-quote',
  heading: {
    // h1: 'text-2xl font-bold',
    // h2: 'text-xl font-bold',
    // h3: 'text-lg font-bold',
    // h4: 'text-base font-bold',
    // h5: 'font-bold',
    // h6: 'font-bold',
  },
  list: {
    // nested: {
    //   listitem: 'editor-nested-listitem',
    // },
    // ol: 'editor-list-ol',
    // ul: 'editor-list-ul',
    // listitem: 'editor-listItem',
    listitemChecked: 'checked',
    listitemUnchecked: 'unchecked',
  },
  link: 'cursor-pointer text-link hover:underline',
  //
  text: {
    bold: 'font-bold',
    code: 'font-mono',
    italic: 'italic',
    strikethrough: 'line-through',
    subscript: 'align-sub',
    superscript: 'align-super',
    underline: 'underline',
    underlineStrikethrough: '[text-decoration:underline_line-through]',
  },
  layoutContainer: 'grid',
  layoutItem: 'p-2 border-1 border-gray-200 rounded-md',
}

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error) {
  console.error(error)
}

export function Editor({ imageUpload, onChange, value }: EditorProps = {}) {
  const initialConfig = {
    namespace: 'MyEditor',
    theme,
    onError,
    // Use value as initial content when provided (only read once by LexicalComposer).
    // Subsequent changes are handled by SyncValuePlugin.
    editorState: value ? JSON.stringify(value) : undefined,
    nodes: [
      HeadingNode, LinkNode,
      TableNode, TableCellNode, TableRowNode,
      ImageNode,
      LayoutContainerNode, LayoutItemNode,
      QRCodeNode,
      ListNode, ListItemNode, ChecklistItemNode, {
        replace: ListItemNode,
        with: (node: ListItemNode) => new ChecklistItemNode(node.getValue(), node.getChecked()),
        withKlass: ChecklistItemNode,
      },
    ],
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="border-1 border-black min-w-200">
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
      <SyncValuePlugin value={value} />
      <OnChangePlugin onChange={(editorState, _editor, tags) => {
        if (tags.has(EXTERNAL_UPDATE_TAG)) return
        onChange?.(editorState.toJSON())
      }} />
    </LexicalComposer>
  )
}
