import { useState } from 'react'
import { LexicalEditor } from 'lexical'

import { ToolbarHookReturn } from './types'

import { Button } from 'libraries/ui'

import { INSERT_TABLE_COMMAND } from '../plugins/TablePlugin'
import { TableIcon } from './icons'
import { ToolbarButton } from './ToolbarButton'

export function useTableToolbar(editor: LexicalEditor): ToolbarHookReturn {
  const [isTableInsertMode, setIsTableInsertMode] = useState(false)
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

  return {
    button: (
      <ToolbarButton
        onClick={() => { setIsTableInsertMode(true) }}
        active={isTableInsertMode}
        aria-label="Insert table">
        <TableIcon />
      </ToolbarButton>
    ),
    editor: isTableInsertMode && (
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
    ),
  }
}
