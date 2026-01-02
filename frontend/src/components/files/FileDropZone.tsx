import { useDragOver } from './useDragOver'

interface FileDropZoneProps {
  children: React.ReactNode
  enabled?: boolean
  onDrop?: (files: DataTransferItem[]) => unknown
}

export function FileDropZone({ enabled, children, onDrop }: FileDropZoneProps) {
  const { ref, isOver } = useDragOver<HTMLDivElement>({ dropEffect: 'copy', onDrop })
  if (!enabled) {
    return <div>{children}</div>
  }

  return <div
    ref={ref}
    className={isOver ? 'outline-2 outline-blue-200 rounded-xs bg-blue-50/25' : ''}
  >
    {children}
  </div>
}
