import classNames from 'classnames'

export { AutosizedSection } from './AutosizedSection'
export { Breadcrumb, BreadcrumbsContainer } from './Breadcrumbs'
export { AnchorButton, type AnchorButtonProps, Button, type ButtonProps } from './Button'
export { Callout } from './Callout'
export { Card } from './Card'
export { default as Collapse } from './Collapse'
export { CounterTag } from './CounterTag'
export { FormGroup, type FormGroupProps } from './FormGroup'
export { GlobalSpinner } from './GlobalLoadingSpinner'
export { ItemList, type Sort } from './ItemList'
export { Link, RegularLink } from './Link'
export { LoadingSpinner } from './LoadingSpinner'
export { ModeButton, ModeSelector } from './ModeSelector'
export { PageSection, ToolbarContainer } from './PageSection'
export { SearchBar } from './SearchBar'
export { Tab, TabButtonContainer, TabLink, TabPanel, Tabs } from './Tabs'
export { ToastContainer } from './toaster'
export type { Color } from './types'

export function H2({ children, className, ...props }: React.ComponentPropsWithoutRef<'h2'>) {
  return <h2 className={classNames(className ?? 'mb-4', 'font-bold text-lg')} {...props}>{children}</h2>
}
