import { Upload } from '@blueprintjs/icons'

import { useFiles } from 'services/files'

import { useFormatDateTime } from 'libraries/i18n/dateTime'
import { Button, RegularLink } from 'libraries/ui'
import ItemList from 'libraries/ui/ItemList'
import { useT } from 'i18n'

import { UploadButton } from './UploadButton'
import useFilesize from './useFilesize'

export function FileList() {
  const [files, fetchFiles] = useFiles()
  const filesize = useFilesize()
  const T = useT('components.files')
  const formatDate = useFormatDateTime()

  return <div>
    <div className="flex my-2">
      <UploadButton onUpload={fetchFiles} text="Lisää tiedosto"/>
      <Button text="Reload" onClick={fetchFiles} />
    </div>
    <ItemList columns="grid-cols-[1fr_minmax(200px,auto)_minmax(100px,auto)_min-content]">
      {files.map(file => <ItemList.Row key={file._id}>
        <RegularLink href={`/api/files/${file._id}?download=true`} target="_blank">{file.name}</RegularLink>
        <span>{formatDate(file._updatedAt)}</span>
        <span>{filesize(file.size)}</span>
        <UploadButton minimal icon={<Upload />} fileId={file._id} onUpload={fetchFiles} />
      </ItemList.Row>)}
      {files.length === 0 && <div className="text-center py-6 col-span-full text-muted text-base">{T('noFiles')}</div>}
    </ItemList>
  </div>
}

