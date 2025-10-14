import { Button } from 'libraries/ui'
import { useT } from 'i18n'

import useFilesize from './useFilesize'
import { Upload } from './useUploadQueue'

export function UploadProgressList({ uploads }: { uploads: (Upload & {id: number})[] }) {
  const T = useT('components.files')
  if (uploads.length === 0) return null

  return <div className="flex gap-3 p-2 my-2 bg-gray-100 rounded-md items-top w-fit">
    <div className="leading-7">{T('uploadingFiles', { count: uploads.length })}</div>
    <div className="grid grid-cols-[1fr_auto_auto]">
      {uploads.map(upload => <UploadProgress key={upload.id} {...upload} />)}
    </div>
  </div>
}

export function UploadProgress({ file, progress: _progress, abort }: Upload) {
  const filesize = useFilesize()
  const progress = _progress ?? {
    uploaded: 0, total: file.size,
  }
  const percentage = `${progress.uploaded / progress.total * 200}%`

  return <div className="grid grid-cols-subgrid col-span-full gap-3 items-center">
    <span>{file.name}</span>
    <div className="relative w-40 h-5 bg-white inset-shadow-sm shadow-black border-1 border-gray-400">
      <div style={{ width: percentage }} className="absolute top-0 left-0 h-full  bg-linear-to-r from-lime-400 to-amber-200 from-70%"></div>
      <span className="absolute inset-0 text-center">{filesize(progress.uploaded)}/{filesize(progress.total)}</span>
    </div>
    <Button minimal text="X" onClick={abort} />
  </div>
}
