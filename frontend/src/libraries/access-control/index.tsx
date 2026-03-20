import { RequirePermissions, type RightsQueryProps } from './RequirePermissions'

export { AccessControlProvider } from './context'
export { useRight, useRights } from './hooks'
export { RequirePermissions, type RightsQueryProps, useRequirePermissions } from './RequirePermissions'
export type { RightQuery, ServiceName } from './types'

export type PermissionCheckedProps = Partial<RightsQueryProps>

export function withPermissionChecking<Props>(
  Component: React.ComponentType<Props>,
) {
  return ({ requireRight, ...props }: Props & PermissionCheckedProps) => (
    <RequirePermissions requireRight={requireRight ?? []} {...props}>
      <Component {...props as Props} requireRight={requireRight} />
    </RequirePermissions>
  )
}

export function omitPermissionCheckingProps<Props>(props: Props & PermissionCheckedProps): Props {
  const {
    requireRight: _ignoreRight, entityId: _ignoreEntityId,
    context: _ignorecontext, contextId: _ignorecontextId,
    owner: _ignoreOwner, owningId: _ignoreOwningId,
    ...rest
  } = props
  return rest as Props
}
