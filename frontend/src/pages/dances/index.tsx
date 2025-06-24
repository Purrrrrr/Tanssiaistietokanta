import {Fragment, useState} from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import {useNavigate} from 'react-router-dom'

import { DanceInput, DanceWithEvents } from 'types'

import { filterDances, useCreateDance, useDances } from 'services/dances'

import {Button, Card, SearchBar, showToast} from 'libraries/ui'
import {DanceEditor} from 'components/DanceEditor'
import {LoadingState, useGlobalLoadingAnimation} from 'components/LoadingState'
import {PageTitle} from 'components/PageTitle'
import {useT, useTranslation} from 'i18n'
import {uploadDanceFile} from 'utils/uploadDanceFile'

function DancesPage() {
  const t = useT('pages.dances.danceList')
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [dances, requestState] = useDances()
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
    <LoadingState {...requestState} />
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

function DanceList({dances}: {dances: DanceWithEvents[]}) {
  const [limit, setLimit] = useState(5)
  const canShowMore = dances.length > limit
  const t = useT('pages.dances.danceList')
  if (!dances.length) return null

  const categories = sliceCategories(dances, limit)

  return <InfiniteScroll hasMore={canShowMore} loadMore={() => setLimit(limit + 5)}>
    {categories.map(category =>
      <Fragment>
        <h2>{category.title || t('noCategory')}</h2>
        {category.dances.map((dance : DanceWithEvents) =>
          <Card key={dance._id}>
            <DanceEditor dance={dance} showLink />
          </Card>
        )}
      </Fragment>
    )}
  </InfiniteScroll>
}

function sliceCategories(allDances: DanceWithEvents[], limit: number) {
  const byCategory = Object.groupBy(allDances, dance => dance.category ?? '')
  const categories = Object.keys(byCategory).sort()
  let limitRemaining = limit
  interface DanceBlock {
    title: string
    dances: DanceWithEvents[]
  }
  const categoryBlocks : DanceBlock[] = []

  for (const category of categories) {
    const dances = byCategory[category]
    if (!dances) continue

    categoryBlocks.push({
      title: category,
      dances: dances.length < limitRemaining ? dances : dances.slice(0, limitRemaining)
    })
    limitRemaining -= dances.length
    if (limitRemaining <= 0) break
  }
  return categoryBlocks
}
export default DancesPage
