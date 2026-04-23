import { BaseSelection } from 'lexical'

export interface ToolbarHookReturn {
  name: string
  button?: React.ReactNode
  onUpdate?: (selection: BaseSelection | null) => void
  editor?: React.ReactNode
}
