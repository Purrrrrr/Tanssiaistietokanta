import { useState } from 'react'

import { Volunteer } from 'types'

import { usePatchVolunteer } from 'services/volunteers'

import { Dialog } from 'libraries/overlays'
import { Button, FormGroup, ItemList } from 'libraries/ui'
import { ManyToOne } from 'libraries/ui/icons'
import { useT, useTranslation } from 'i18n'

export interface MergeVolunteersButtonProps {
  selectedVolunteers: Volunteer[]
  onMerge: () => void
}

export function MergeVolunteersButton({ selectedVolunteers, onMerge }: MergeVolunteersButtonProps) {
  const t = useT('routes.volunteers')
  const [dialogOpen, setDialogOpen] = useState(false)

  if (selectedVolunteers.length < 2) return null

  return <>
    <Button
      minimal
      icon={<ManyToOne />}
      text={t('mergeVolunteers', { count: selectedVolunteers.length })}
      onClick={() => setDialogOpen(true)}
    />
    <MergeVolunteersDialog
      selectedVolunteers={selectedVolunteers}
      isOpen={dialogOpen}
      onClose={() => setDialogOpen(false)}
      onMergeSuccess={onMerge}
    />
  </>
}

interface MergeVolunteersDialogProps {
  selectedVolunteers: Volunteer[]
  isOpen: boolean
  onClose: () => void
  onMergeSuccess: () => void
}

function MergeVolunteersDialog({ selectedVolunteers, isOpen, onClose, onMergeSuccess }: MergeVolunteersDialogProps) {
  const t = useT('routes.volunteers')
  const [patchVolunteer] = usePatchVolunteer({
    refetchQueries: ['getVolunteers'],
  })
  const [canonicalVolunteer, setCanonicalVolunteer] = useState<Volunteer | null>(null)

  const mergeVolunteers = async () => {
    if (!canonicalVolunteer) return
    const toMerge = selectedVolunteers.filter(v => v._id !== canonicalVolunteer._id)
    await Promise.all(toMerge.map(v => patchVolunteer({ id: v._id, volunteer: { duplicatedBy: canonicalVolunteer._id } })))
    onClose()
    onMergeSuccess()
    setCanonicalVolunteer(null)
  }

  return <Dialog
    isOpen={isOpen}
    onClose={onClose}
    title={t('mergeVolunteersDialog.title')}
    closeButtonLabel={useTranslation('common.close')}
  >
    <form onSubmit={e => { e.preventDefault(); mergeVolunteers() }}>
      <Dialog.Body>
        <FormGroup label={t('mergeVolunteersDialog.keepVolunteerLabel')} labelFor="canonical-volunteer">
          <ItemList items={selectedVolunteers} emptyText="" columns="grid-cols-[auto_1fr]" className="bg-white rounded-lg">
            <ItemList.Header>
              <span>{t('mergeVolunteersDialog.choose')}</span>
              <span>{t('mergeVolunteersDialog.name')}</span>
            </ItemList.Header>
            {selectedVolunteers.map(volunteer =>
              <ItemList.Row key={volunteer._id}>
                <input
                  id={`canonical-volunteer-${volunteer._id}`}
                  type="radio"
                  name="canonical-volunteer"
                  value={volunteer._id}
                  checked={canonicalVolunteer?._id === volunteer._id}
                  onChange={() => setCanonicalVolunteer(volunteer)}
                />
                <label htmlFor={`canonical-volunteer-${volunteer._id}`}>{volunteer.name}</label>
              </ItemList.Row>,
            )}
          </ItemList>
        </FormGroup>
      </Dialog.Body>
      <Dialog.Footer className="flex flex-row-reverse">
        <Button color="primary" type="submit" text={t('mergeVolunteersDialog.merge')} />
        <Button text={useTranslation('common.cancel')} onClick={onClose} />
      </Dialog.Footer>
    </form>
  </Dialog>
}
