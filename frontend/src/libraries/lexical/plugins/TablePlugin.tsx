import { TablePlugin as LexicalTablePlugin } from '@lexical/react/LexicalTablePlugin'

export { INSERT_TABLE_COMMAND } from '@lexical/table'

export function TablePlugin() {
  return (
    <LexicalTablePlugin
      hasCellMerge
      hasCellBackgroundColor={false}
      hasTabHandler
    />
  )
}
