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

import { TableIcon } from './icons'
import { ToolbarButton } from './ToolbarButton'
import { ToolbarTitle } from './ToolbarTitle'

export function useTableToolbar(editor: LexicalEditor): ToolbarHookReturn {
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
        onClick={() => { setIsTableInsertMode(true) }}
        active={isTableInsertMode}
        aria-label="Insert table">
        <TableIcon />
      </ToolbarButton>
    ),
    floatingEditor: <>
      {isInTable && (
        <div className="flex flex-col">
          <ToolbarTitle text="Table options" />
          <Button minimal onClick={insertRow} aria-label="Insert row below">Insert row below</Button>
          <Button minimal onClick={insertColumn} aria-label="Insert column right">Insert column right</Button>
          <Button minimal onClick={deleteRow} aria-label="Remove this row">Remove this row</Button>
          <Button minimal onClick={deleteColumn} aria-label="Remove this column">Remove this column</Button>
          <Button minimal onClick={removeTable} aria-label="Remove this table">Remove this table</Button>
        </div>
      )}
      {isTableInsertMode && (
        <div className="flex gap-2 items-center py-1 px-2 border-black border-t-1">
          <label htmlFor="table-rows-input" className="text-sm">Rows</label>
          <input
            id="table-rows-input"
            className="py-0.5 px-2 w-12 text-sm rounded border-gray-400 border-1"
            type="number"
            min="1"
            max="50"
            value={tableRows}
            onChange={(e) => setTableRows(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') insertTable(); if (e.key === 'Escape') setIsTableInsertMode(false) }}
          />
          <label htmlFor="table-cols-input" className="text-sm">Cols</label>
          <input
            id="table-cols-input"
            className="py-0.5 px-2 w-12 text-sm rounded border-gray-400 border-1"
            type="number"
            min="1"
            max="50"
            value={tableCols}
            onChange={(e) => setTableCols(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') insertTable(); if (e.key === 'Escape') setIsTableInsertMode(false) }}
          />
          <Button minimal onClick={insertTable} aria-label="Insert table">Insert</Button>
          <Button minimal onClick={() => setIsTableInsertMode(false)} aria-label="Cancel">Cancel</Button>
        </div>
      )}
    </>,
  }
}
