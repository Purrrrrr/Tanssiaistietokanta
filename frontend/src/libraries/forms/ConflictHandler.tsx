import { CaretDown } from '@blueprintjs/icons'
import classNames from 'classnames'

import { ConflictData } from './types'

import MenuButton from 'libraries/formsV2/components/MenuButton'
import {Button} from 'libraries/ui'

import {useFormStrings} from './formContext'

export function ConflictHandler({localValue, serverValue, onResolve}: ConflictData) {
  const strings = useFormStrings()
  return <>
    {strings.hasConflicts}{' '}
    <MenuButton
      text={strings.conflictButton}
      buttonRenderer={({active, children, ...props}) =>
        <button type="button" className={classNames(className, { active })} {...props}>
          {children}
          <CaretDown />
        </button>
      }
    >
      <div className="flex gap-3 p-2">
        <div>
          {strings.server}
          {serverValue}
          <Button color="primary" text={strings.chooseThis} onClick={() => onResolve('SERVER')} />
        </div>
        <div>
          {strings.local}
          {localValue}
          <Button color="primary" text={strings.chooseThis} onClick={() => onResolve('LOCAL')} />
        </div>
      </div>
    </MenuButton>
  </>
}

const className = 'p-1 text-red-700 bg-white border-red-700 hover:bg-red-50 active:text-red-900 active:bg-red-200 border-1 rounded-xs'
