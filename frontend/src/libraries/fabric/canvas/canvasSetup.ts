import { classRegistry, config, FabricObject } from 'fabric'

import { Arrowline } from './Arrowline'

declare module 'fabric' {
  // to have the properties recognized on the instance and in the constructor
  interface FabricObject {
    _id?: string
  }
  // to have the properties typed in the exported object
  interface SerializedObjectProps {
    _id?: string
  }
}

FabricObject.customProperties = ['_id']
FabricObject.ownDefaults.includeDefaultValues = false
config.NUM_FRACTION_DIGITS = 2

classRegistry.setClass(Arrowline)
