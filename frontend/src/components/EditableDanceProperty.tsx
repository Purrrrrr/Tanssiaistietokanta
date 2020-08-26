import React from 'react';
import {PATCH_DANCE} from "services/dances";
import { useMutation } from 'services/Apollo';
import {ClickToEdit} from "libraries/forms";

import './EditableDanceProperty.sass';

interface EditableDancePropertyProps {
  dance: any,
  property: string,
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
  return <ClickToEdit className="editableDanceProperty"
    editorComponent={multiline ? ClickToEdit.MultilineEditor : ClickToEdit.TextEditor}
    value={dance[property]} onChange={onChange} editButton={undefined}
    valueFormatter={value => value || <span className="addEntry">{addText}</span>}
  />;
}
