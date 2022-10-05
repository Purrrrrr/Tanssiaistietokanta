import React from 'react';
import {DurationField} from "components/widgets/DurationField";
import {Input} from "libraries/forms";
import {MarkdownEditor} from 'components/MarkdownEditor';
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
  return <Flex spaced className="danceEditor">
    <div>
      <Input label="Nimi" value={name ?? ""} onChange={onChangeFor('name')}  />
      <Input label="Kategoria" value={category ?? ""} onChange={onChangeFor('category')}  />
      <DurationField label="Kesto" value={duration} onChange={onChangeFor('duration')} />
      <Input label="Alkusoitto" value={prelude ?? ""} onChange={onChangeFor('prelude')}  />
      <Input label="Tanssikuvio" value={formation ?? ""} onChange={onChangeFor('formation')}  />
      <Input label="Huomautuksia" value={remarks ?? ""} onChange={onChangeFor('remarks')}  />
    </div>
    <div className="flex-fill">
      <MarkdownEditor label="Kuvaus" value={description ?? ""} onChange={onChangeFor('description')} />
      <MarkdownEditor label="Tanssiohjeet" value={instructions} onChange={onChangeFor('instructions')} />
    </div>
  </Flex>;
}
