import React, {useState} from 'react';
import {H1, Card, Button, FormGroup, Intent, InputGroup} from "@blueprintjs/core";
import InfiniteScroll from 'react-infinite-scroller';

import { useDances, useCreateDance, useModifyDance, useDeleteDance } from '../services/dances';

import {sorted} from "../utils/sorted"
import {showToast} from "../utils/toaster"

import {CreateDanceDialog} from "../components/CreateDanceDialog"
import {DanceEditor} from "../components/DanceEditor"

function DancesPage() {
  const [search, setSearch] = useState("");
  const [dances] = useDances();
  const onError = (e) => showToast({intent: Intent.DANGER, message: `Tietojen tallennus epäonnistui :( Syy: ${e.message}`});
  const [modifyDance] = useModifyDance({onError});
  const [createDance] = useCreateDance({onError});
  const [deleteDance] = useDeleteDance({onError});

  const filteredDances = getDances(dances, search);
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

function getDances(dances, search) {
  return sorted(
    dances.filter(dance => filterDance(dance, search)),
    (a, b) => a.name.localeCompare(b.name)
  );
}

function filterDance(dance, search) {
  const lSearch = search.toLowerCase();
  const lName = dance.name.toLowerCase();
  return !dance.deleted && lName.indexOf(lSearch) !== -1;
}

function DanceList({dances, onChange, onDelete}) {
  const [limit, setLimit] = useState(5);
  const canShowMore = dances.length > limit;

  return <InfiniteScroll hasMore={canShowMore} loadMore={() => setLimit(limit + 5)}>
    {dances.slice(0, limit).map(dance => 
      <Card key={dance._id}>
        <DanceEditor dance={dance} onChange={onChange} onDelete={onDelete} />
      </Card>)}
    </InfiniteScroll>
}

function CreateDanceButton({onCreate}) {
  const [isOpen, setIsOpen] = useState(false);
  return <>
    <Button text="Uusi tanssi" onClick={() => setIsOpen(true)}/>
    <CreateDanceDialog isOpen={isOpen} onClose={() => setIsOpen(false)} onCreate={onCreate} />
  </>
}


export default DancesPage;
