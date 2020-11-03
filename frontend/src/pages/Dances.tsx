import React, {useState} from 'react';
import {Intent, Card, Collapse, FormGroup, InputGroup} from "@blueprintjs/core";
import InfiniteScroll from 'react-infinite-scroller';
import {Breadcrumb} from "components/Breadcrumbs";
import {PageTitle} from "components/PageTitle";

import { filterDances, Dance, useDances, useCreateDance, useModifyDance, useDeleteDance } from 'services/dances';

import {CreateDanceForm, DanceUploader} from "components/CreateDanceForm"
import {DanceEditor} from "components/DanceEditor"
import {showToast} from 'utils/toaster';
import {Button} from "libraries/forms";

const EMPTY_DANCE : Dance = {name: 'Uusi tanssi'};

function DancesPage() {
  const [search, setSearch] = useState("");
  const [dances] = useDances();
  const [modifyDance] = useModifyDance();
  const [createDance] = useCreateDance();
  const [deleteDance] = useDeleteDance();

  const filteredDances = filterDances(dances, search);
  const onDelete = ({_id}) => deleteDance(_id);
  const [danceToCreate, setDanceToCreate] = useState<Dance | null>(null);

  async function doCreateDance(dance : Dance) {
    await createDance(dance);
    setDanceToCreate(null);
    showToast({
      intent: Intent.PRIMARY,
      message: `Tanssi ${dance.name} luotu`,
      action: {text: "Näytä tanssi", onClick: () => setSearch(dance.name)}
    });
  }

  return <>
    <Breadcrumb text="Tanssit" />
    <PageTitle>Tanssit</PageTitle>
    <div style={{display: "flex", alignItems: "flex-start"}}>
      <FormGroup inline label="Hae" labelFor="search-dances" >
        <InputGroup id="search-dances" leftIcon="search" rightElement={<Button aria-label="Tyhjennä haku" minimal icon="cross" onClick={() => setSearch("")} />}
          value={search} onChange={(e) => setSearch(e.target.value)} />
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
  </>;
}

function DanceList({dances, onChange, onDelete}) {
  const [limit, setLimit] = useState(5);
  const canShowMore = dances.length > limit;
  if (!dances.length) return null;

  return <InfiniteScroll hasMore={canShowMore} loadMore={() => setLimit(limit + 5)}>
    {dances.slice(0, limit).map((dance : Dance) =>
      <Card key={dance._id}>
        <DanceEditor dance={dance} onChange={onChange} onDelete={onDelete}  />
      </Card>)}
    </InfiniteScroll>;
}


export default DancesPage;
