import type { CSSProperties } from 'react'
import QRCode_import from 'react-qr-code'
import classNames from 'classnames'
import type { NodeKey } from 'lexical'

import type { QRCodePayload } from '../nodes/QRCodeNode'

const QRImage = (QRCode_import as unknown as { default: typeof QRCode_import }).default

interface QRCodeProps extends QRCodePayload {
  nodeKey?: NodeKey
  selected?: boolean
}

export function QRCode({ size, value, title, selected, nodeKey }: QRCodeProps) {
  const pxSize = `${size / 14}em`
  return <span
    className={classNames(
      'qr-container',
      selected && 'outline-2 outline-blue-500 bg-selection',
    )}
    style={{ '--qr-size': pxSize } as CSSProperties}
    data-qr-node-key={nodeKey}
  >
    {title && <span className="title">{title}</span>}
    <span className="svg-container">
      <QRImage value={value ?? ''} size={size} />
    </span>
    <span className="url">{value}</span>
  </span>
}
