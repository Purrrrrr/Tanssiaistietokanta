import { ButtonProps } from '../Button'

export interface AlertProps {
  title: string
  children: React.ReactNode
  button?: AlertAction
  buttons?: AlertAction[]
  isOpen: boolean
  onClose(): void
  onChoose?(action: AlertAction): void
}

export type AlertAction = string | ActionProps

interface ActionProps extends Pick<ButtonProps, 'icon' | 'color'> {
  id?: string
  text: string
  action?(): unknown
}

export type ShowAlert = (alert: ShowAlertProps) => Promise<AlertAction>
export type ShowAlertProps = Pick<AlertProps, 'title' | 'children' | 'button' | 'buttons'>
