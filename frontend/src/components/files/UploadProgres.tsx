import { useRef } from 'react'

import { Button } from 'libraries/ui'
import { useT, useTranslation } from 'i18n'

import useFilesize from './useFilesize'
import { Upload } from './useUploadQueue'

export function UploadProgressList({ uploads }: { uploads: (Upload & {id: number})[] }) {
  const T = useT('components.files')
  if (uploads.length === 0) return null

  return <div className="flex gap-3 w-fit">
    <div className="py-2">{T('uploadingFiles', { count: uploads.length })}</div>
    <div className="-mt-1 px-2 py-1 bg-gray-100 rounded-md  grid grid-cols-[auto_auto_auto_auto] gap-4">
      {uploads.map(upload => <UploadProgress key={upload.id} {...upload} />)}
    </div>
  </div>
}

export function UploadProgress({ file, progress: _progress, abort, error }: Upload) {
  const filesize = useFilesize()
  const progress = _progress ?? {
    uploaded: 0, total: file.size,
  }
  const percentage = `${progress.uploaded / progress.total * 100}%`
  const speed = useUploadSpeed(progress.uploaded)

  return <div className="grid grid-cols-subgrid col-span-full items-center">
    <span>{file.name}</span>
    {error
      ? <div className="col-span-2 text-red-800 font-semibold">{error}</div>
      : <>
        <div className="relative w-40 h-5 bg-white inset-shadow-sm shadow-black border-1 border-gray-400">
          <div style={{ width: percentage }} className="absolute top-0 left-0 h-full  bg-linear-to-r from-lime-400 to-amber-200 from-70%"></div>
          <span className="absolute inset-0 text-center">{filesize(progress.uploaded)}/{filesize(progress.total)}</span>
        </div>
        <div className='min-w-16 text-right'>{filesize(speed)}/s</div>
      </>
    }
    <Button color="danger" text={useTranslation('common.cancel')} onClick={abort} />
  </div>
}

function useUploadSpeed(uploaded: number) {
  const lastUploaded = useRef<number>(uploaded)
  const lastUpdate = useRef<number>(Date.now())
  const speed = useRef<number>(0)

  if (uploaded !== lastUploaded.current) {
    const now = Date.now()
    if (lastUpdate.current !== now) {
      speed.current = (uploaded - lastUploaded.current) / (now - lastUpdate.current) * 1000
    }
    lastUploaded.current = uploaded
    lastUpdate.current = now
  }

  return speed.current
}
