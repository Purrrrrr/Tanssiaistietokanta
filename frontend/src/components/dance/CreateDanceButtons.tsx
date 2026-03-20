import { useNavigate } from '@tanstack/react-router'

import { DanceInput } from 'types'

import { addGlobalLoadingAnimation } from 'backend'
import { useCreateDance } from 'services/dances'

import { Button, showToast } from 'libraries/ui'
import { useT, useTranslation } from 'i18n'

import { uploadDanceFile } from './uploadDanceFile'

export function CreateDanceButtons({ danceCount }: { danceCount: number }) {
  const t = useT('components.dance.createDanceButton')
  const navigate = useNavigate()
  const [createDance] = useCreateDance()

  async function doCreateDance(dance: DanceInput) {
    const result = await addGlobalLoadingAnimation(createDance({ dance }))
    const danceId = result.data?.createDance?._id

    if (danceId) {
      navigate({ to: '/dances/$danceId', params: { danceId } })
      showToast({
        color: 'primary',
        message: t('danceCreated', { name: dance.name }),
      })
    }
  }

  return <>
    <Button
      text={t('createDance')}
      onClick={() => doCreateDance(emptyDance(t('untitledDance', { number: danceCount + 1 })))}
    />
    <DanceUploader onUpload={(dance) => doCreateDance(dance)} />
  </>
}

function emptyDance(name: string): DanceInput {
  return { name }
}

function DanceUploader({ onUpload }: { onUpload: (d: DanceInput) => unknown }) {
  async function chooseFile() {
    const dance = await uploadDanceFile()
    if (dance) onUpload(dance)
  }

  return <Button text={useTranslation('components.dance.createDanceButton.uploadDance')} onClick={chooseFile} />
}
