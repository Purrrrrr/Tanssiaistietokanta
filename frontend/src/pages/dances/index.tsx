import React, {useState} from 'react'
import {Breadcrumb, Collapse, Card, Button, FormGroup, SearchBar} from 'libraries/ui'
import InfiniteScroll from 'react-infinite-scroller'
import {PageTitle} from 'components/PageTitle'
import {showToast} from 'utils/toaster'

import { filterDances, Dance, useDances, useCreateDance, usePatchDance, useDeleteDance } from 'services/dances'

import {CreateDanceForm, DanceUploader} from './CreateDanceForm'
import {DanceListItem} from './DanceListItem'

const EMPTY_DANCE : Dance = {name: 'Uusi tanssi'}

function DancesPage() {
  const [search, setSearch] = useState('')
  const [dances] = useDances()
  const [modifyDance] = usePatchDance()
  const [createDance] = useCreateDance()
  const [deleteDance] = useDeleteDance()

  const filteredDances = filterDances(dances, search)
  const onDelete = ({_id}) => deleteDance(_id)
  const [danceToCreate, setDanceToCreate] = useState<Dance | null>(null)

  async function doCreateDance(dance : Dance) {
    await createDance(dance)
    setDanceToCreate(null)
    showToast({
      intent: 'primary',
      message: `Tanssi ${dance.name} luotu`,
      action: {text: 'Näytä tanssi', onClick: () => setSearch(dance.name)}
    })
  }

  return <>
    <Breadcrumb text="Tanssit" />
    <PageTitle>Tanssit</PageTitle>
    <div style={{display: 'flex', alignItems: 'flex-start'}}>
      <FormGroup inline label="Hae" labelFor="search-dances" >
        <SearchBar id="search-dances" value={search} onChange={setSearch} />
      </FormGroup>
      <Button text="Uusi tanssi" onClick={() => setDanceToCreate(EMPTY_DANCE)}/>
      <DanceUploader onUpload={setDanceToCreate} />
    </div>
    <Collapse isOpen={danceToCreate !== null} component={p => <div {...p} aria-live="polite" />}>
      <Card elevation={1}>
        <CreateDanceForm initialData={danceToCreate}
          onCancel={() => setDanceToCreate(null)}
          onCreate={doCreateDance} />
      </Card>
      <br />
    </Collapse>
    <DanceList key={search} dances={filteredDances} onChange={modifyDance} onDelete={onDelete} />
  </>
}

function DanceList({dances, onChange, onDelete}) {
  const [limit, setLimit] = useState(5)
  const canShowMore = dances.length > limit
  if (!dances.length) return null

  return <InfiniteScroll hasMore={canShowMore} loadMore={() => setLimit(limit + 5)}>
    {dances.slice(0, limit).map((dance : Dance) =>
      <Card key={dance._id}>
        <DanceListItem dance={dance} onChange={onChange} onDelete={onDelete}  />
      </Card>)}
  </InfiniteScroll>
}

export default DancesPage
