import React, {useState} from 'react'
import * as L from 'partial.lenses'

import {FieldComponentProps, formFor, MenuButton, SelectorMenu, toArrayPath, TypedStringPath} from 'libraries/forms'
import {DanceChooser} from 'components/widgets/DanceChooser'
import {SlideStyleSelector} from 'components/widgets/SlideStyleSelector'
import {useT} from 'i18n'

import {Dance} from 'types'

import {DanceProgram, EventProgramItem, EventProgramSettings, ProgramItemPath, RequestedDance} from '../types'

const {
  Field,
  useValueAt,
  useOnChangeFor,
} = formFor<EventProgramSettings>()

export const DanceProgramChooser = React.memo(function DanceProgramChooser({value, onChange, ...props} : FieldComponentProps<EventProgramItem, HTMLElement>) {
  const t = useT('components.eventProgramEditor')
  return <DanceChooser
    key={value?._id}
    value={value?._id ? value as Dance : null}
    onChange={(dance, e) => onChange(
      dance
        ? {...dance, __typename: 'Dance'} as DanceProgram
        : {__typename: 'RequestedDance'} as RequestedDance,
      e
    )}
    allowEmpty
    emptyText={t('programTypes.RequestedDance')}
    {...props}
  />
})

export function MoveItemToSectionSelector({itemPath} : { itemPath: ProgramItemPath}) {
  const t = useT('components.eventProgramEditor')
  const [open, setOpen] = useState(false)
  return <MenuButton
    menu={
      <MoveItemToSectionMenu
        itemPath={itemPath}
        onSelected={() => setOpen(false)}
      />
    }
    text={t('fields.moveItemToSection')}
    open={open}
    onSetOpen={setOpen}
  />
}

interface SectionSelection {
  name: string
  index: number
  isIntroductionsSection?: boolean
}
function MoveItemToSectionMenu(
  {itemPath, onSelected} : { itemPath: ProgramItemPath, onSelected: () => void }
) {
  const t = useT('components.eventProgramEditor', 'common')
  const [currentSectionType, maybeDanceSetIndex] = toArrayPath<EventProgramSettings>(itemPath)
  const row = useValueAt(itemPath)
  const onChangeProgram = useOnChangeFor('')

  const canMoveToIntroductions = currentSectionType === 'danceSets' && row?.item?.__typename === 'EventProgram'
  const introSection : SectionSelection = {name: t('titles.introductoryInformation'), isIntroductionsSection: true, index: 0}
  const sections = useValueAt('danceSets')
    .map(({title}, index) => ({name: title, index}))
    .filter(({index}) => currentSectionType !== 'danceSets' || index !== maybeDanceSetIndex)

  //If something is deleted useValueAt may return undefined
  if (row === undefined) return null

  return <SelectorMenu<SectionSelection>
    items={canMoveToIntroductions ? [introSection, ...sections] : sections}
    getItemText={item => item?.name ?? ''}
    filterable
    emptySearchText={t('emptySearch')}
    searchPlaceholder={t('search')}
    itemPredicate={(search, item) => item.name.toLowerCase().includes(search.toLowerCase())}
    onSelect={(section) => {
      onSelected()
      onChangeProgram((program: EventProgramSettings) => {
        const removeItem = L.set(toArrayPath<EventProgramSettings>(itemPath), undefined)
        const addItem = L.set(
          [
            section.isIntroductionsSection
              ? ['introductions', 'program', L.appendTo]
              : ['danceSets', section.index, 'program', L.appendTo]
          ],
          row,
        )
        return addItem(removeItem(program)) as EventProgramSettings
      })
    }}
  />
}

export function InheritedSlideStyleSelector(
  {path, text, showLabel}:
  {
    path: TypedStringPath<string, EventProgramSettings>
    text: string
    showLabel?: boolean
  }
) {
  const t = useT('components.eventProgramEditor')
  const defaultSlideStyleId = useValueAt('slideStyleId')

  return <Field
    label={text}
    labelStyle={showLabel ? undefined : 'hidden'}
    inline={showLabel ? undefined : true}
    path={path}
    component={SlideStyleSelector}
    componentProps={{text, inheritsStyles: true, inheritedStyleId: defaultSlideStyleId, inheritedStyleName: t('fields.eventDefaultStyle')}}
  />
}
