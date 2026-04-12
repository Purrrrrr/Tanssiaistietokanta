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
import { $getRoot } from 'lexical'
import { minify } from 'lexical-minifier'

import { ChecklistItemNode } from './ChecklistItemNode'
import { CheckboxUIPlugin } from './plugins/Checkbox'
import ToolbarPlugin from './Toolbar'

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
}

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error) {
  console.error(error)
}

export function Editor() {
  const initialConfig = {
    namespace: 'MyEditor',
    theme,
    onError,
    nodes: [HeadingNode, ListNode, ListItemNode, LinkNode, ChecklistItemNode, {
      replace: ListItemNode,
      with: (node: ListItemNode) => new ChecklistItemNode(node.getValue(), node.getChecked()),
      withKlass: ChecklistItemNode,
    }],
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="border-1 border-black min-w-200">
        <ToolbarPlugin />
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
      <CheckboxUIPlugin />
      <OnChangePlugin onChange={(editorState) => {
        editorState.read(() => {
          console.log(editorState.toJSON())
          // const json = minify($getRoot())
          // console.log(json, JSON.stringify(editorState.toJSON()).length, JSON.stringify(json).length)
        })
      }} />
    </LexicalComposer>
  )
}
