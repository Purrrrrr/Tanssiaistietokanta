import React, {useState} from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import {useNavigate} from 'react-router-dom'

import { filterDances, useCreateDance, useDances } from 'services/dances'

import {Button, Card, FormGroup, SearchBar} from 'libraries/ui'
import {PageTitle} from 'components/PageTitle'
import {showToast} from 'utils/toaster'
import {uploadDanceFile} from 'utils/uploadDanceFile'

import { Dance, DanceInput } from 'types'

import {DanceEditor} from './DanceEditor'

const EMPTY_DANCE : DanceInput = {name: 'Uusi tanssi'}

function DancesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [dances] = useDances()
  const [createDance] = useCreateDance()

  const filteredDances = filterDances(dances, search)

  async function doCreateDance(dance : DanceInput) {
    const result = await createDance({dance})
    const id = result.data?.createDance?._id

    if (id) {
      navigate(id)
      showToast({
        intent: 'primary',
        message: `Tanssi ${dance.name} luotu`,
      })
    }
  }

  return <>
    <PageTitle>Tanssit</PageTitle>
    <div style={{display: 'flex', alignItems: 'flex-start'}}>
      <FormGroup inline label="Hae" labelFor="search-dances" >
        <SearchBar id="search-dances" value={search} onChange={setSearch} />
      </FormGroup>
      <Button text="Uusi tanssi" onClick={() => doCreateDance(EMPTY_DANCE)}/>
      <DanceUploader onUpload={(dance) => doCreateDance(dance)} />
    </div>
    <DanceList key={search} dances={filteredDances} />
  </>
}

function DanceUploader({onUpload} : {onUpload: (d: DanceInput) => unknown}) {
  async function chooseFile() {
    const dance = await uploadDanceFile()
    if (dance) onUpload(dance)
  }

  return <Button text="Tuo tanssi tiedostosta" onClick={chooseFile}/>
}

function DanceList({dances}) {
  const [limit, setLimit] = useState(5)
  const canShowMore = dances.length > limit
  if (!dances.length) return null

  return <InfiniteScroll hasMore={canShowMore} loadMore={() => setLimit(limit + 5)}>
    {dances.slice(0, limit).map((dance : Dance) =>
      <Card key={dance._id}>
        <DanceEditor dance={dance} showLink />
      </Card>)}
  </InfiniteScroll>
}

export default DancesPage
