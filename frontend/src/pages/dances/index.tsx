import {useState} from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import {useNavigate} from 'react-router-dom'

import { filterDances, useCreateDance, useDances } from 'services/dances'

import {Button, Card, SearchBar} from 'libraries/ui'
import {DanceEditor} from 'components/DanceEditor'
import {useGlobalLoadingAnimation} from 'components/LoadingState'
import {PageTitle} from 'components/PageTitle'
import {useT, useTranslation} from 'i18n'
import {showToast} from 'utils/toaster'
import {uploadDanceFile} from 'utils/uploadDanceFile'

import { DanceInput, DanceWithEvents } from 'types'

function DancesPage() {
  const t = useT('pages.dances.danceList')
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [dances] = useDances()
  const [createDance] = useCreateDance()
  const addLoadingAnimation = useGlobalLoadingAnimation()

  const filteredDances = filterDances(dances, search)

  async function doCreateDance(dance : DanceInput) {
    const result = await addLoadingAnimation(createDance({dance}))
    const id = result.data?.createDance?._id

    if (id) {
      navigate(id)
      showToast({
        intent: 'primary',
        message: t('danceCreated', {name: dance.name}),
      })
    }
  }

  return <>
    <PageTitle>{t('pageTitle')}</PageTitle>
    <div style={{marginBottom: 10, display: 'flex', alignItems: 'flex-start'}}>
      <SearchBar id="search-dances" value={search} onChange={setSearch} placeholder={useTranslation('common.search')} emptySearchText={useTranslation('common.emptySearch')}/>
      <Button text={t('createDance')} onClick={() => doCreateDance(emptyDance(t('untitledDance', {number: dances.length+1})))}/>
      <DanceUploader onUpload={(dance) => doCreateDance(dance)} />
    </div>
    <DanceList key={search} dances={filteredDances} />
  </>
}

function emptyDance(name: string): DanceInput {
  return {name}
}
function DanceUploader({onUpload} : {onUpload: (d: DanceInput) => unknown}) {
  async function chooseFile() {
    const dance = await uploadDanceFile()
    if (dance) onUpload(dance)
  }

  return <Button text={useTranslation('pages.dances.danceList.uploadDance')} onClick={chooseFile}/>
}

function DanceList({dances}) {
  const [limit, setLimit] = useState(5)
  const canShowMore = dances.length > limit
  if (!dances.length) return null

  return <InfiniteScroll hasMore={canShowMore} loadMore={() => setLimit(limit + 5)}>
    {dances.slice(0, limit).map((dance : DanceWithEvents) =>
      <Card key={dance._id}>
        <DanceEditor dance={dance} showLink />
      </Card>)}
  </InfiniteScroll>
}

export default DancesPage
