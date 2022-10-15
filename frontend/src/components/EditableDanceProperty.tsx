import React from 'react';
import {usePatchDance, WritableDanceProperty, dancePropertyLabels} from "services/dances";
import {ClickToEdit} from "libraries/forms2";
import {EditableMarkdown} from 'components/EditableMarkdown';

import './EditableDanceProperty.sass';

type ValidProperty = Exclude<WritableDanceProperty, 'duration' | 'instructions'>

interface EditableDancePropertyProps {
  dance: any,
  property: ValidProperty,
  addText: string,
  type?: 'multiline' | 'markdown'
}

export function EditableDanceProperty({dance, property, addText, ...props} : EditableDancePropertyProps) {
  const [patch] = usePatchDance();

  const onChange = (value) => {
    patch({
      _id: dance._id,
      [property]: value,
    })
  }

  if (!dance?._id) return <>...</>;

  const editorType = props["type"]

  if (editorType === 'markdown') {
    return <EditableMarkdown id={property} label="" value={dance[property]} onChange={onChange} />
  }

  return <ClickToEdit id={property} className="editableDanceProperty"
    value={dance[property]} onChange={onChange}
    valueFormatter={value => value || <span className="addEntry">{addText}</span>}
  />;
}

