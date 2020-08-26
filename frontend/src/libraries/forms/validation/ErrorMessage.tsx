import React from 'react';
import {Icon, Tag, Intent} from "@blueprintjs/core";

export function ErrorMessage({error}) {
  return error ?
    <Tag intent={Intent.DANGER}>
      <Icon icon="warning-sign"/>
      {' '}{error.errors.join(', ')}
    </Tag> : null;
}
