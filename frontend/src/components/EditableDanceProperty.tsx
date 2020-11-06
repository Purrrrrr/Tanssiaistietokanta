import React from 'react';
import {PATCH_DANCE, WritableDanceProperty, dancePropertyLabels} from "services/dances";
import { useMutation } from 'services/Apollo';
import {ClickToEdit} from "libraries/forms";

import './EditableDanceProperty.sass';

type ValidProperty = Exclude<WritableDanceProperty, 'duration' | 'instructions'>

interface EditableDancePropertyProps {
  dance: any,
  property: ValidProperty,
  addText: string,
  multiline?: boolean
}

export function EditableDanceProperty({dance, property, addText, multiline} : EditableDancePropertyProps) {
  const [patch, state] = useMutation(PATCH_DANCE);

  const onChange = (value) => {
    patch({
      variables: {
        id: dance._id,
        dance: {[property]: value}
      }
    })
  }

  if (state.loading) return <>...</>;
  return <ClickToEdit label={dancePropertyLabels[property]} labelStyle="hidden" className="editableDanceProperty"
    editorComponent={multiline ? ClickToEdit.MultilineEditor : ClickToEdit.TextEditor}
    value={dance[property]} onChange={onChange}
    valueFormatter={value => value || <span className="addEntry">{addText}</span>}
  />;
}
