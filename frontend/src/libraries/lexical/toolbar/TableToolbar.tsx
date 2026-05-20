import { useState } from 'react'
import {
  $deleteTableColumnAtSelection, $deleteTableRowAtSelection,
  $insertTableColumnAtSelection, $insertTableRowAtSelection,
  $isTableCellNode, INSERT_TABLE_COMMAND,
  TableCellNode,
} from '@lexical/table'
import { $findMatchingParent } from '@lexical/utils'
import { $isRangeSelection, LexicalEditor } from 'lexical'

import { ToolbarHookReturn } from './types'

import { Button } from 'libraries/ui'

import { useEditorT } from '../i18n'
import { TableIcon } from './icons'
import { ToolbarButton, ToolbarInput, ToolbarRow, ToolbarTitle } from './widgets'

export function useTableToolbar(editor: LexicalEditor): ToolbarHookReturn {
  const t = useEditorT('table')
  const [isTableInsertMode, setIsTableInsertMode] = useState(false)
  const [currentCell, setCurrentCell] = useState<TableCellNode | null>(null)
  const isInTable = currentCell !== null
  const [tableRows, setTableRows] = useState('3')
  const [tableCols, setTableCols] = useState('3')

  function insertTable() {
    const rows = Math.max(1, parseInt(tableRows, 10) || 1).toString()
    const columns = Math.max(1, parseInt(tableCols, 10) || 1).toString()
    editor.dispatchCommand(INSERT_TABLE_COMMAND, {
      rows,
      columns,
      includeHeaders: { rows: true, columns: false },
    })
    setIsTableInsertMode(false)
  }

  const removeTable = () => {
    editor.update(() => {
      if (!currentCell) return
      const tableNode = $findMatchingParent(currentCell, node => node.getType() === 'table')
      tableNode?.remove()
    })
  }
  const insertRow = () => editor.update($insertTableRowAtSelection)
  const insertColumn = () => editor.update($insertTableColumnAtSelection)
  const deleteRow = () => editor.update($deleteTableRowAtSelection)
  const deleteColumn = () => editor.update($deleteTableColumnAtSelection)

  return {
    onUpdate: (selection) => {
      if ($isRangeSelection(selection)) {
        const cellNode = $findMatchingParent(
          selection.anchor?.getNode(),
          $isTableCellNode,
        )
        setCurrentCell(cellNode)
      } else {
        setCurrentCell(null)
      }
    },
    button: (
      <ToolbarButton
        key="insertTable"
        onClick={() => { setIsTableInsertMode(true) }}
        active={isTableInsertMode}
        tooltip={t('insertTable')}>
        <TableIcon />
      </ToolbarButton>
    ),
    floatingEditor: <>
      {isInTable && (
        <div className="flex flex-col">
          <ToolbarTitle text={t('tableOptions')} />
          <Button minimal onClick={insertRow}>{t('insertRow')}</Button>
          <Button minimal onClick={insertColumn}>{t('insertColumn')}</Button>
          <Button minimal onClick={deleteRow}>{t('deleteRow')}</Button>
          <Button minimal onClick={deleteColumn}>{t('deleteColumn')}</Button>
          <Button minimal color="danger" onClick={removeTable}>{t('deleteTable')}</Button>
        </div>
      )}
      {isTableInsertMode && (
        <ToolbarRow title={t('insertTable')}>
          <ToolbarInput
            label={t('rows')}
            type="number"
            min="1"
            max="50"
            value={tableRows}
            onChange={setTableRows}
            onKeyDown={(e) => { if (e.key === 'Enter') insertTable(); if (e.key === 'Escape') setIsTableInsertMode(false) }}
          />
          <ToolbarInput
            label={t('cols')}
            type="number"
            min="1"
            max="50"
            value={tableCols}
            onChange={setTableCols}
            onKeyDown={(e) => { if (e.key === 'Enter') insertTable(); if (e.key === 'Escape') setIsTableInsertMode(false) }}
          />
          <ToolbarButton onClick={insertTable} text={t('insertTable')} />
          <ToolbarButton onClick={() => setIsTableInsertMode(false)} text={t('cancel')} />
        </ToolbarRow>
      )}
    </>,
  }
}
