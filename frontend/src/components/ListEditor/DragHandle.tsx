import React from 'react'
import {Button} from 'libraries/ui'
import {asFormControl} from 'libraries/forms2'
import {SortableHandle} from 'react-sortable-hoc'

export const DragHandle = asFormControl(SortableHandle((props) =>
  <Button icon="move" {...props} />
))
