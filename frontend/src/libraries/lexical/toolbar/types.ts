import { BaseSelection } from 'lexical'

export interface ToolbarHookReturn {
  button?: React.ReactNode
  onUpdate?: (selection: BaseSelection | null) => void
  floatingEditor?: React.ReactNode
  otherElements?: React.ReactNode
}
