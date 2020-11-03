import React from 'react';
import {Icon, Tag, Intent} from "@blueprintjs/core";

export function ErrorMessage(
  {id, error} : 
  {id ?: string, error: {errors: string[]} | null}
) {
  return error !== null ?
    <Tag id={id} intent={Intent.DANGER}>
      <Icon icon="warning-sign"/>
      {' '}{error.errors.join(', ')}
    </Tag> : null;
}
