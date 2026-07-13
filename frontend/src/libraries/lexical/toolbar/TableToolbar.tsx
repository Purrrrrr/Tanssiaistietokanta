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
import { AddColumnRight, AddRowBottom, RemoveColumn, RemoveRowBottom } from 'libraries/ui/icons'

import { useEditorT } from '../i18n'
import { useSetAnchorElement } from '../utils/useSetAnchorElement'
import { TableIcon } from './icons'
import { FloatingToolbar, ToolbarButton, ToolbarInput, ToolbarRow } from './widgets'

const rowAnchorName = '--lexical-table-row-toolbar-anchor'
const colAnchorName = '--lexical-table-column-toolbar-anchor'
const tableAnchorName = '--lexical-table-toolbar-anchor'

export function useTableToolbar(editor: LexicalEditor): ToolbarHookReturn {
  const t = useEditorT('table')
  const [isTableInsertMode, setIsTableInsertMode] = useState(false)
  const [currentCell, setCurrentCell] = useState<TableCellNode | null>(null)
  const isInTable = currentCell !== null
  const [tableRows, setTableRows] = useState('3')
  const [tableCols, setTableCols] = useState('3')
  const setColAnchor = useSetAnchorElement(colAnchorName)
  const setRowAnchor = useSetAnchorElement(rowAnchorName)
  const setTableAnchor = useSetAnchorElement(tableAnchorName)

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

  const selectCellNode = (node: TableCellNode | null) => {
    setCurrentCell(node)
    if (node) {
      const colIdx = node.getIndexWithinParent()
      const cell = editor.getElementByKey(node.getKey())
      const row = cell?.closest('tr')
      const table = cell?.closest('table')
      const firstRow = table?.querySelector('tr')
      const lastCell = table?.querySelector('tr:last-child')?.querySelector('td:last-child, th:last-child')
      setRowAnchor(row)
      setColAnchor(firstRow?.children[colIdx] as HTMLElement)
      setTableAnchor(lastCell as HTMLElement)
    } else {
      setColAnchor(null)
    }
  }

  return {
    onUpdate: (selection) => {
      if ($isRangeSelection(selection)) {
        const cellNode = $findMatchingParent(
          selection.anchor?.getNode(),
          $isTableCellNode,
        )
        selectCellNode(cellNode)
      } else {
        selectCellNode(null)
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
    otherElements: isInTable && <>
      <FloatingToolbar anchorName={rowAnchorName} side="right">
        <ToolbarButton onClick={insertRow} tooltip={t('insertRow')} icon={<AddRowBottom />} />
        <ToolbarButton onClick={deleteRow} tooltip={t('deleteRow')} color="danger" icon={<RemoveRowBottom />} />
      </FloatingToolbar>
      <FloatingToolbar anchorName={colAnchorName} side="top span-right">
        <ToolbarButton onClick={insertColumn} tooltip={t('insertColumn')} icon={<AddColumnRight />} />
        <ToolbarButton onClick={deleteColumn} tooltip={t('deleteColumn')} color="danger" icon={<RemoveColumn />} />
      </FloatingToolbar>
      <FloatingToolbar anchorName={tableAnchorName} side="bottom right">
        <Button minimal color="danger" onClick={removeTable}>{t('deleteTable')}</Button>
      </FloatingToolbar>
    </>,
    floatingEditor: <>
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
