import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { $getRoot } from 'lexical'
import { minify } from 'lexical-minifier'

import ToolbarPlugin from './Toolbar'

const theme = {
  // TODO
  paragraph: 'my-2',
  quote: 'editor-quote',
  heading: {
    h1: 'editor-heading-h1',
    h2: 'editor-heading-h2',
    h3: 'editor-heading-h3',
    h4: 'editor-heading-h4',
    h5: 'editor-heading-h5',
    h6: 'editor-heading-h6',
  },
  list: {
    nested: {
      listitem: 'editor-nested-listitem',
    },
    ol: 'editor-list-ol',
    ul: 'editor-list-ul',
    listitem: 'editor-listItem',
    listitemChecked: 'editor-listItemChecked',
    listitemUnchecked: 'editor-listItemUnchecked',
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
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="border-1 border-black min-w-200">
        <ToolbarPlugin />
        <div className="p-2 border-t-1 border-black **:focus:outline-none!">
          <RichTextPlugin
            contentEditable={
              <ContentEditable />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
      </div>
      <HistoryPlugin />
      <OnChangePlugin onChange={(editorState) => {
        editorState.read(() => {
          const json = minify($getRoot())
          console.log(json, JSON.stringify(editorState.toJSON()).length, JSON.stringify(json).length)
        })
      }} />
    </LexicalComposer>
  )
}
