import type { CSSProperties } from 'react'
import QRCode_import from 'react-qr-code'
import type { NodeKey } from 'lexical'

import type { QRCodePayload } from '../nodes/QRCodeNode'

const QRImage = (QRCode_import as unknown as { default: typeof QRCode_import }).default

export function QRCode({ size, value, title, nodeKey }: QRCodePayload & { nodeKey?: NodeKey }) {
  const pxSize = `${size / 14}em`
  return <div
    className="qr-container"
    style={{ '--qr-size': pxSize } as CSSProperties}
    data-qr-node-key={nodeKey}
  >
    {title && <p>{title}</p>}
    <div className="svg-container">
      <QRImage value={value ?? ''} size={size} />
    </div>
    <p className="url">{value}</p>
  </div>
}
