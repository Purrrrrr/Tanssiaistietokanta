import React from 'react';
import {Icon, Tag, Intent} from "@blueprintjs/core";

export function ErrorMessage({message}) {
  return message ?
    <Tag intent={Intent.DANGER}>
      <Icon icon="warning-sign"/>
      {' '}{message}
    </Tag> : null;
}
