import { ComponentPropsWithoutRef } from 'react'

import { PageTitle } from 'components/PageTitle'
import { useT } from 'i18n'

interface VersionedPageTitleProps extends ComponentPropsWithoutRef<typeof PageTitle> {
  showVersion?: boolean // True by default
  versionNumber?: number | string | null
}

export function VersionedPageTitle({ children, showVersion = true, versionNumber, ...props }: VersionedPageTitleProps) {
  return <PageTitle {...props}>
    {useVersionedName(children, showVersion ? versionNumber : null)}
  </PageTitle>
}

export function useVersionedName(name: string, versionNumber?: number | string | null) {
  const tCommon = useT('common')

  return versionNumber
    ? `${name} (${tCommon('version', { version: versionNumber })})`
    : name
}
