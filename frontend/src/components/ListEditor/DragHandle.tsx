import React from 'react';
import {Button} from "libraries/ui";
import {SortableHandle} from 'react-sortable-hoc';

export const DragHandle = SortableHandle((props) => 
  <Button icon="move" {...props} />
);
