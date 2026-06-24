import classNames from 'classnames'

export function H2({ children, className, ...props }: React.ComponentPropsWithoutRef<'h2'>) {
  return <h2 className={classNames(className ?? 'mb-4', 'font-bold text-lg')} {...props}>{children}</h2>
}
