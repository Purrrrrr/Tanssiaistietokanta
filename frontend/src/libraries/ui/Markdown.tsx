import type { ComponentPropsWithoutRef, CSSProperties } from 'react'
import QRCode from 'react-qr-code'
import classNames from 'classnames'
import MarkdownToJsx from 'markdown-to-jsx'

import './Markdown.css'

export function Markdown({options, className, ...props}: ComponentPropsWithoutRef<typeof MarkdownToJsx>) {
  return <MarkdownToJsx
    className={classNames(className, 'markdown-content')}
    {...props}
    options={options
      ? { ...options, overrides: { ...markdownComponents, ...options.overrides } }
      : Markdown.defaultOptions
    }
  />
}

const markdownComponents = {
  QR: ({size, value, title, ...props}) => {
    const parsedSize = parseInt(size, 10)
    const pxSize = `${parsedSize}px`
    return  <div className="qr-container" style={{'--qr-size': pxSize} as CSSProperties}>
      {title && <p>{title}</p>}
      <QRCode {...props} value={value ?? ''} size={parsedSize} />
      <p className="url">{value}</p>
    </div>
  },
}
Markdown.defaultOptions = { overrides: markdownComponents }
