import { RequirePermissions, type RightsQueryProps } from './RequirePermissions'

export { AccessControlProvider } from './context'
export { useRight, useRights } from './hooks'
export { RequirePermissions, type RightsQueryProps, useRequirePermissions } from './RequirePermissions'
export type { RightQuery, ServiceName } from './types'

export type PermissionCheckedProps = Partial<RightsQueryProps>

export function withPermissionChecking<Props>(
  Component: React.ComponentType<Props>,
): React.ComponentType<Props & PermissionCheckedProps> {
  return (props: Props & PermissionCheckedProps) => (
    <RequirePermissions requireRight={props.requireRight ?? []}{...props}>
      <Component {...props} />
    </RequirePermissions>
  )
}

export function omitPermissionCheckingProps<Props>(props: Props & PermissionCheckedProps): Props {
  const {
    requireRight: _ignoreRight, entityId: _ignoreEntityId,
    context: _ignorecontext, contextId: _ignorecontextId,
    owner: _ignoreOwner, ownerId: _ignoreOwnerId,
    ...rest
  } = props
  return rest as Props
}
