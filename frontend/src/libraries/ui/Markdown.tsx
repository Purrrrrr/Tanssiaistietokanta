import type { ComponentPropsWithoutRef, CSSProperties } from 'react'
import QRCode from 'react-qr-code'
import classNames from 'classnames'
import MarkdownToJsx from 'markdown-to-jsx'

import { RegularLink } from './Link'

import './Markdown.css'

export default function Markdown({options, className, ...props}: ComponentPropsWithoutRef<typeof MarkdownToJsx>) {
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
  a: RegularLink,
  QR: ({size, fontSize, value, title, ...props}) => {
    const parsedFontSize = parseFloat(fontSize ?? '100') / 100
    const parsedSize = parseInt(size, 10)
    const pxSize = `${parsedSize / 14}em`
    return  <div className="qr-container" style={{'--qr-size': pxSize, '--qr-font-size': parsedFontSize} as CSSProperties}>
      {title && <p>{title}</p>}
      <div className="svg-container">
        <QRCode {...props} value={value ?? ''} size={parsedSize} />
      </div>
      <p className="url">{value}</p>
    </div>
  },
}
Markdown.defaultOptions = { overrides: markdownComponents }
