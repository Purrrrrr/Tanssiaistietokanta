import { useEffect } from 'react'

import { useDragOver } from './useDragOver'

interface FileDropZoneProps {
  children: React.ReactNode
  onDrop?: (files: File[]) => unknown
}

export function FileDropZone({ children, onDrop }: FileDropZoneProps) {
  const { ref, isOver } = useDragOver<HTMLDivElement>({ dropEffect: 'copy', onDrop })
  return <div
    ref={ref}
    className={isOver ? 'outline-2 outline-blue-200 rounded-xs bg-blue-50/25' : ''}
  >
    {children}
  </div>
}
