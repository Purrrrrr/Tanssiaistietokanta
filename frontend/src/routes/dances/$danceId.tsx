import { createFileRoute, useNavigate, useParams, useSearch } from '@tanstack/react-router'

import { useDance } from 'services/dances'

import { Breadcrumb } from 'libraries/ui'
import { DanceEditor } from 'components/dance/DanceEditor'
import { DanceIsUsedIn } from 'components/dance/DanceIsUsedIn'
import { danceVersionLink } from 'components/dance/DanceLink'
import { DeleteDanceButton } from 'components/dance/DeleteDanceButton'
import { LoadingState } from 'components/LoadingState'
import { Page } from 'components/Page'
import VersionableContentContainer from 'components/versioning/VersionableContentContainer'
import { VersionSidebarToggle } from 'components/versioning/VersionSidebarToggle'
import { BackLink } from 'components/widgets/BackLink'
import { useT } from 'i18n'

export const Route = createFileRoute(
  '/dances/$danceId',
)({
  component: RouteComponent,
  validateSearch: (params): { versionId?: string } => {
    return { versionId: typeof params.versionId === 'string' ? params.versionId : undefined }
  },
  loaderDeps: ({ search: { versionId } }) => ({ versionId }),
  loader: async ({ params: { danceId }, deps: { versionId }, context: { queryClient } }) => {
    const dance = await queryClient.query({
      query: useDance.query,
      variables: { id: danceId, versionId },
    })
    return { dance }
  },
  staticData: {
    requireRights: ({ danceId }) => ({
      rights: 'dances:read',
      entityId: danceId,
    }),
    breadcrumb: RouteBreadcrumb,
  },
})

function RouteBreadcrumb() {
  const { danceId } = Route.useParams()
  const { versionId } = Route.useSearch()
  const result = useDance({ id: danceId ?? '', versionId })

  if (!result.data?.dance) return null

  return <Breadcrumb
    to="/dances/$danceId"
    params={{ danceId }}
    search={{ versionId }}
    text={result.data.dance.name}
  />
}

function RouteComponent() {
  return <VersionableContentContainer>
    <DancePage />
  </VersionableContentContainer>
}

function DancePage() {
  const navigate = useNavigate()
  const { danceId } = useParams({ from: Route.id })
  const { versionId } = useSearch({ from: Route.id })
  const result = useDance({ id: danceId ?? '', versionId })
  const t = useT('pages.dances.dancePage')

  if (!result.data?.dance) return <LoadingState {...result} />

  const { dance } = result.data

  return <Page
    title={dance.name}
    showVersion={!!versionId}
    versionNumber={dance._versionNumber}
    backLink={
      <BackLink to="/dances">{t('backToDanceList')}</BackLink>
    }
    toolbar={
      <div className="flex items-center">
        <VersionSidebarToggle entityType="dance" entityId={dance._id} versionId={dance._versionId ?? undefined} toVersionLink={danceVersionLink} />
        <DanceIsUsedIn events={dance.events} />
        <div>
          <DeleteDanceButton dance={dance} onDelete={() => { navigate({ to: '/dances' }) }} />
        </div>
      </div>
    }
  >
    <DanceEditor dance={dance} />
  </Page>
}
