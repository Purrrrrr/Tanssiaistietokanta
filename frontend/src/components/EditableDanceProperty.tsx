import React from 'react';
import {usePatchDance, WritableDanceProperty, dancePropertyLabels} from "services/dances";
import {ClickToEdit} from "libraries/forms";
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
  const [patch, state] = usePatchDance();

  const onChange = (value) => {
    patch({
      _id: dance._id,
      [property]: value,
    })
  }

  if (state.loading) return <>...</>;

  const editorType = props["type"]

  if (editorType === 'markdown') {
    return <EditableMarkdown label="" value={dance[property]} onChange={onChange} />
  }

  return <ClickToEdit label={dancePropertyLabels[property]} labelStyle="hidden" className="editableDanceProperty"
    editorComponent={editorType === 'multiline' ? ClickToEdit.MultilineEditor : ClickToEdit.TextEditor}
    value={dance[property]} onChange={onChange}
    valueFormatter={value => value || <span className="addEntry">{addText}</span>}
  />;
}

