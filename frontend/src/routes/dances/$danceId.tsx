import { createFileRoute, useNavigate, useParams, useSearch } from '@tanstack/react-router'

import { useDance } from 'services/dances'

import { Breadcrumb } from 'libraries/ui'
import { DanceEditor } from 'components/dance/DanceEditor'
import { LoadingState } from 'components/LoadingState'
import { PageTitle } from 'components/PageTitle'
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

interface DancePageProps {
  parentType?: 'eventProgram' | 'dances'
}

function DancePage({ parentType = 'dances' }: DancePageProps) {
  const navigate = useNavigate()
  const { danceId } = useParams({ from: Route.id })
  const { versionId } = useSearch({ from: Route.id })
  const result = useDance({ id: danceId ?? '', versionId })
  const t = useT('pages.dances.dancePage')

  if (!result.data?.dance) return <LoadingState {...result} />

  const { dance } = result.data

  return <>
    <PageTitle noRender>{dance.name}</PageTitle>
    <BackLink to="..">{t(parentType === 'dances' ? 'backToDanceList' : 'backToEventProgram')}</BackLink>
    <DanceEditor
      titleComponent="h1"
      dance={dance}
      showVersionHistory
      onDelete={() => { navigate({ to: '/dances' }) }}
    />
  </>
}
