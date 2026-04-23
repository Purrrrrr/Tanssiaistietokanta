import { BaseSelection } from 'lexical'

export interface ToolbarHookReturn {
  button?: React.ReactNode
  onUpdate?: (selection: BaseSelection | null) => void
  editor?: React.ReactNode
}
