import { createFileRoute, useNavigate, useParams, useSearch } from '@tanstack/react-router'

import { useDance } from 'services/dances'

import { Breadcrumb } from 'libraries/ui'
import { DanceEditor } from 'components/dance/DanceEditor'
import { LoadingState } from 'components/LoadingState'
import { PageTitle } from 'components/PageTitle'
import { RequirePermissions } from 'components/rights/RequirePermissions'
import VersionableContentContainer from 'components/versioning/VersionableContentContainer'
import { BackLink } from 'components/widgets/BackLink'
import { useT } from 'i18n'

export const Route = createFileRoute(
  '/dances/$danceId',
)({
  component: RouteComponent,
  validateSearch: (params): { versionId?: string } => {
    return { versionId: typeof params.versionId === 'string' ? params.versionId : undefined }
  },
})

function RouteComponent() {
  return <VersionableContentContainer>
    <DancePage />
  </VersionableContentContainer>
}

interface DancePageProps {
  parentType?: 'eventProgram' | 'dances'
}

function DancePage({ parentType = 'dances' }: DancePageProps) {
  const navigate = useNavigate()
  const { danceId } = useParams({ from: '/dances/$danceId' })
  const { versionId } = useSearch({ from: '/dances/$danceId' })
  const result = useDance({ id: danceId ?? '', versionId })
  const t = useT('pages.dances.dancePage')

  if (!result.data?.dance) return <LoadingState {...result} />

  const { dance } = result.data

  return <>
    <Breadcrumb to="/dances/$danceId" params={{ danceId }} search={{ versionId }} text={dance.name} />
    <PageTitle noRender>{dance.name}</PageTitle>
    <BackLink to="..">{t(parentType === 'dances' ? 'backToDanceList' : 'backToEventProgram')}</BackLink>
    <RequirePermissions requireRight="dances:read">
      <DanceEditor
        titleComponent="h1"
        dance={dance}
        showVersionHistory
        onDelete={() => { navigate({ to: '/dances' }) }}
      />
    </RequirePermissions>
  </>
}
