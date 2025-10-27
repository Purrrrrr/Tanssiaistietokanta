import { useNavigate, useParams } from 'react-router-dom'

import { useDance } from 'services/dances'

import { Breadcrumb } from 'libraries/ui'
import { DanceEditor } from 'components/dance/DanceEditor'
import { LoadingState } from 'components/LoadingState'
import { PageTitle } from 'components/PageTitle'
import { BackLink } from 'components/widgets/BackLink'
import { useT } from 'i18n'

interface DancePageProps {
  parentType?: 'eventProgram' | 'dances'
}

export default function DancePage({ parentType = 'dances' }: DancePageProps) {
  const navigate = useNavigate()
  const { danceId, danceVersionId } = useParams()
  const result = useDance({ id: danceId ?? '', versionId: danceVersionId })
  const t = useT('pages.dances.dancePage')

  if (!result.data?.dance) return <LoadingState {...result} />

  const { dance } = result.data

  return <>
    <Breadcrumb text={dance.name} />
    <PageTitle noRender>{dance.name}</PageTitle>
    <BackLink>{t(parentType === 'dances' ? 'backToDanceList' : 'backToEventProgram')}</BackLink>
    <DanceEditor titleComponent="h1" dance={dance} showVersionHistory onDelete={() => { navigate('..') }} />
  </>
}
