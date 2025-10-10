import { Upload } from '@blueprintjs/icons'

import { useFiles } from 'services/files'

import { Button, RegularLink } from 'libraries/ui'
import ItemList from 'libraries/ui/ItemList'

import { UploadButton } from './UploadButton'
import useFilesize from './useFilesize'

export function FileList() {
  const [files, fetchFiles] = useFiles()
  const filesize = useFilesize()

  return <div>
    <div className="flex my-2">
      <UploadButton onUpload={fetchFiles} text="Lisää tiedosto"/>
      <Button text="Reload" onClick={fetchFiles} />
    </div>
    <ItemList columns="grid-cols-[1fr_1fr_1fr_min-content]">
      {files.map(file => <ItemList.Row key={file._id}>
        <span>{file._id}</span>
        <span>{filesize(file.size)}</span>
        <RegularLink href={`/api/files/${file._id}?download=true`} target="_blank">{file.name}</RegularLink>
        <UploadButton minimal icon={<Upload />} fileId={file._id} onUpload={fetchFiles} />
      </ItemList.Row>)}
    </ItemList>
  </div>
}

