import React from 'react';
import {EditableText} from "components/EditableText";
import {PATCH_DANCE} from "services/dances";
import { useMutation } from 'services/Apollo';
import {showDefaultErrorToast} from "utils/toaster"

export function EditableDanceProperty({dance, property, ...props}) {
  const [patch, state] = useMutation(PATCH_DANCE, {
    onError: showDefaultErrorToast
  })

  const onChange = (value) => {
    patch({
      variables: {
        id: dance._id,
        dance: {[property]: value}
      }
    }) 
  }

  if (state.loading) return '...';

  return <EditableText {...props} text={dance[property]}
    onChange={onChange} />;
}
