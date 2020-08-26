import React from 'react';
import {Button} from "@blueprintjs/core";
import {SortableHandle} from 'react-sortable-hoc';

export const DragHandle = SortableHandle((props) => 
  <Button icon="move" {...props} />
);
