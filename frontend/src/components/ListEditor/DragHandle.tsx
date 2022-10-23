import React from 'react'
import {SortableHandle} from 'react-sortable-hoc'

import {asFormControl} from 'libraries/forms2'
import {Button} from 'libraries/ui'

export const DragHandle = asFormControl(SortableHandle((props) =>
  <Button icon="move" {...props} />
))
