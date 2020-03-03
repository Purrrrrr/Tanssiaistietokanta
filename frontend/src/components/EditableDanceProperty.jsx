import React from 'react';
import {PATCH_DANCE} from "services/dances";
import { useMutation } from 'services/Apollo';
import {ClickToEdit} from "libraries/forms";

import './EditableDanceProperty.sass';

export function EditableDanceProperty({dance, property, addText, multiline}) {
  const [patch, state] = useMutation(PATCH_DANCE);

  const onChange = (value) => {
    patch({
      variables: {
        id: dance._id,
        dance: {[property]: value}
      }
    })
  }

  if (state.loading) return '...';
  return <ClickToEdit className="editableDanceProperty" growVertically={multiline}
    value={dance[property] ?? ""} onChange={onChange} noEditIcon
    valueFormatter={value => value || <span className="addEntry">{addText}</span>}
  >
  </ClickToEdit>;
}
