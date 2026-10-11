import { Suspense, useEffect, useId, useState } from 'react'

import { Select } from '@/libraries/formsV2/components/inputs'
import { Button, Dropdown, DropdownContainer, FormGroup } from '@/libraries/ui'
import { useT } from '@/i18n'

import { getProjectionMarginOptions, ProjectionMargins, ProjectionMarginSide, projectionMarginSides } from './projectionMargins'

interface ProjectionSettingsButtonProps {
  margins: ProjectionMargins
  onChange: (side: ProjectionMarginSide, value: number) => void
  onReset: () => void
}

export function ProjectionSettingsButton(props: ProjectionSettingsButtonProps) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const t = useT('components.projectionSettings')

  return <DropdownContainer className="inline-block text-sm">
    <Button
      minimal iconOnly icon="cog" text={t('title')} className="projection-settings-button h-7"
      active={open} popoverTarget={id} aria-expanded={open} aria-controls={id}
    />
    <Dropdown id={id} auto arrow alignment="end" open={open} onToggle={setOpen}>
      <Suspense>
        <ProjectionSettingsPanel {...props} id={id} open={open} />
      </Suspense>
    </Dropdown>
  </DropdownContainer>
}

function ProjectionSettingsPanel({ margins, onChange, onReset, id, open }: ProjectionSettingsButtonProps & { id: string, open: boolean }) {
  const t = useT('components.projectionSettings')

  useEffect(() => {
    if (open) document.getElementById(`${id}-top`)?.focus()
  }, [id, open])

  return <div className="w-64 max-w-full p-3 text-sm font-normal text-stone-700" role="group" aria-labelledby={`${id}-title`}>
    <h2 id={`${id}-title`} className="mb-3 font-semibold">{t('title')}</h2>
    {projectionMarginSides.map(side => <FormGroup key={side} label={t(side)} labelFor={`${id}-${side}`} labelStyle="beside">
      <Select<number>
        id={`${id}-${side}`}
        aria-label={t(side)}
        value={margins[side]}
        items={getProjectionMarginOptions(margins, side)}
        itemToString={value => `${value}%`}
        onChange={value => onChange(side, value)}
      />
    </FormGroup>)}
    <p className="my-3">{t('remembered')}</p>
    <p className="mb-3 text-xs">{t('help')}</p>
    <Button text={t('reset')} onClick={onReset} disabled={projectionMarginSides.every(side => margins[side] === 0)} />
  </div>
}
