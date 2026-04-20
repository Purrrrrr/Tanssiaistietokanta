import type { CSSProperties } from 'react'
import QRCode_import from 'react-qr-code'
import type { NodeKey } from 'lexical'

import type { QRCodePayload } from '../nodes/QRCodeNode'

const QRImage = (QRCode_import as unknown as { default: typeof QRCode_import }).default

export function QRCode({ size, value, title, nodeKey }: QRCodePayload & { nodeKey?: NodeKey }) {
  const pxSize = `${size / 14}em`
  return <span
    className="qr-container"
    style={{ '--qr-size': pxSize } as CSSProperties}
    data-qr-node-key={nodeKey}
  >
    {title && <span>{title}</span>}
    <span className="svg-container">
      <QRImage value={value ?? ''} size={size} />
    </span>
    <span className="url">{value}</span>
  </span>
}
