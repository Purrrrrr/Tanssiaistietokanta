import React from 'react';
import {DurationField} from "components/widgets/DurationField";
import {Input, TextArea} from "libraries/forms";
import {EditableMarkdown} from 'components/EditableMarkdown';
import {useOnChangeForPropInValue} from 'utils/useOnChangeForProp';
import {Dance} from "services/dances";
import {Flex} from 'components/Flex';

import './DanceEditor.sass'

interface DanceEditorProps {
  dance: Dance,
  onChange: (changed: Dance) => any,
}

export function DanceEditor({dance, onChange} : DanceEditorProps) {
  const onChangeFor = useOnChangeForPropInValue(onChange, dance);
  const {instructions, category, name, description, formation, prelude, remarks, duration} = dance;
  return <Flex addSpacing className="danceEditor">
    <div>
      <Input labelStyle="inline" label="Nimi" value={name ?? ""} onChange={onChangeFor('name')}  />
      <Input labelStyle="inline" label="Kategoria" value={category ?? ""} onChange={onChangeFor('category')}  />
      <DurationField labelStyle="inline" label="Kesto" value={duration} onChange={onChangeFor('duration')} />
      <Input labelStyle="inline" label="Alkusoitto" value={prelude ?? ""} onChange={onChangeFor('prelude')}  />
      <Input labelStyle="inline" label="Tanssikuvio" value={formation ?? ""} onChange={onChangeFor('formation')}  />
      <Input labelStyle="inline" label="Huomautuksia" value={remarks ?? ""} onChange={onChangeFor('remarks')}  />
    </div>
    <div className="flex-fill">
      <EditableMarkdown labelStyle="inline" simple label="Kuvaus" value={description ?? ""} onChange={onChangeFor('description')} />
      <EditableMarkdown labelStyle="inline" maxHeight={150} label="Tanssiohjeet" value={instructions} onChange={onChangeFor('instructions')} />
    </div>
  </Flex>;
}
