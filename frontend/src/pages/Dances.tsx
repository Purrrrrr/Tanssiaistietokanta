import React, {useState} from 'react';
import {H1, Card, Button, FormGroup, InputGroup} from "@blueprintjs/core";
import InfiniteScroll from 'react-infinite-scroller';

import { filterDances, useDances, useCreateDance, useModifyDance, useDeleteDance } from 'services/dances';

import {CreateDanceDialog} from "components/CreateDanceDialog"
import {DanceEditor} from "components/DanceEditor"

function DancesPage() {
  const [search, setSearch] = useState("");
  const [dances] = useDances();
  const [modifyDance] = useModifyDance();
  const [createDance] = useCreateDance();
  const [deleteDance] = useDeleteDance();

  const filteredDances = filterDances(dances, search);
  const onDelete = ({_id}) => deleteDance(_id);

  return <>
    <H1>Tanssit</H1>
    <div style={{display: "flex", alignItems: "flex-start"}}>
      <FormGroup inline label="Hae" >
        <InputGroup leftIcon="search" rightElement={<Button minimal icon="cross" onClick={() => setSearch("")} />}
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </FormGroup>
      <CreateDanceButton onCreate={createDance} />
    </div>
    <DanceList key={search} dances={filteredDances} onChange={modifyDance} onDelete={onDelete} />
  </>;
}



function DanceList({dances, onChange, onDelete}) {
  const [limit, setLimit] = useState(5);
  const canShowMore = dances.length > limit;
  if (!dances.length) return null;

  return <InfiniteScroll hasMore={canShowMore} loadMore={() => setLimit(limit + 5)}>
    {dances.slice(0, limit).map((dance, i) =>
      <Card key={dance._id}>
        <DanceEditor dance={dance} onChange={onChange} onDelete={onDelete}  />
      </Card>)}
    </InfiniteScroll>;
}

function CreateDanceButton({onCreate}) {
  const [isOpen, setIsOpen] = useState(false);
  return <>
    <Button text="Uusi tanssi" onClick={() => setIsOpen(true)}/>
    <CreateDanceDialog isOpen={isOpen} onClose={() => setIsOpen(false)} onCreate={onCreate} />
  </>
}


export default DancesPage;
