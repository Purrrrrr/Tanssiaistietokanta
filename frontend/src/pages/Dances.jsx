import React, {useState, useRef} from 'react';
import {H1, Card, Button, FormGroup, Intent, InputGroup, Toaster} from "@blueprintjs/core";
import {createDance, deleteDance, modifyDance, useDances} from "../services/dances";
import {sorted} from "../utils/sorted"
import {CreateDanceDialog} from "../components/CreateDanceDialog"
import {DanceEditor} from "../components/DanceEditor"

function DancesPage() {
  const [search, setSearch] = useState("");
  const [dances, loadDances] = useDances();
  const toaster = useRef();
  const filteredDances = getDances(dances, search);

  const onError = () => toaster.current.show({intent: Intent.DANGER, message: "Tietojen tallennus epäonnistui :("});
  const onChange = (dance) => modifyDance(dance._id, dance).then(loadDances, onError);
  const onCreate = (dance) => createDance(dance).then(loadDances, onError);
  const onDelete = (dance) => deleteDance(dance._id).then(loadDances, onError);

  return <>
    <H1>Tanssit</H1>
    <Toaster ref={toaster} />
    <div style={{display: "flex", alignItems: "flex-start"}}>
      <FormGroup inline label="Hae" >
        <InputGroup leftIcon="search" rightElement={<Button minimal icon="cross" onClick={() => setSearch("")} />}
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </FormGroup>
      <CreateDanceButton onCreate={onCreate} />
    </div>
    {filteredDances.map(dance => <Card key={dance._id}><DanceEditor dance={dance} onChange={onChange} onDelete={onDelete} /></Card>)}


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
  return lName.indexOf(lSearch) !== -1;
}

function CreateDanceButton({onCreate}) {
  const [isOpen, setIsOpen] = useState(false);
  return <>
    <Button text="Uusi tanssi" onClick={() => setIsOpen(true)}/>
    <CreateDanceDialog isOpen={isOpen} onClose={() => setIsOpen(false)} onCreate={onCreate} />
  </>
}


export default DancesPage;
