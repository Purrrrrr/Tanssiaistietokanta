import { Fragment } from 'react'
import { Link } from 'react-router-dom'

import type { VersionCalendar, VersionSidebarProps } from './types'

import { useFormatDate, useFormatTime } from 'libraries/i18n/dateTime'
import SideBar from 'components/SideBar'
import { useT, useTranslation } from 'i18n'

import './VersionChooser.scss'

interface Version {
  _versionId: string
  _versionNumber: number
  _updatedAt: string,
}

interface VersionChooserProps extends Omit<VersionSidebarProps, 'entityType'> {
  name: string
  versions: VersionCalendar
}

export default function VersionChooser({onClose, name, entityId: id, versionId, versions, toVersionLink}: VersionChooserProps) {
  const formatDate = useFormatDate()
  const T = useT('versioning')
  const toLink = (v: string | null) => toVersionLink(id, v)

  return <SideBar>
    <div className="version-chooser">
      <button aria-label={useTranslation('common.close')} className="close" onClick={onClose}>✖</button>
      <h2>{name} - {T('versionHistory')}</h2>
      <VersionNavigation versions={versions} versionId={versionId} toVersionLink={toLink} />
      <div className="versions">
        <h3>{T('now')}</h3>
        <Link to={toLink(null)} className={!versionId ? 'current' : ''}>
          {T('newestVersion')}
        </Link>
        {versions.map(day =>
          <Fragment key={day.date}>
            <h3>{formatDate(new Date(day.date))}</h3>
            <ol>
              {day.versions.map(version =>
                <li key={version._versionNumber}>
                  <VersionLink
                    version={version}
                    toVersionLink={toLink}
                    current={version._versionId === versionId}
                  />
                </li>
              )}
            </ol>
          </Fragment>
        )}
      </div>
    </div>
  </SideBar>
}

interface VersionNavigationProps {
  versionId?: string | null
  versions: VersionCalendar
  toVersionLink: (versionId: string | null) => string
}

function VersionNavigation({versionId, versions, toVersionLink}: VersionNavigationProps ) {
  const T = useT('versioning')
  const allVersions = [{_versionId: null, _versionNumber: null}, ...versions.flatMap(v => v.versions)]
  const versionIndex = versionId ? allVersions.findIndex(v => v._versionId === versionId) : 0
  const currentVersion = allVersions[versionIndex]
  const previousVersion = versionIndex >= 1
    ? allVersions[versionIndex - 1] : null
  const nextVersion = versionIndex + 1 < allVersions.length
    ? allVersions[versionIndex + 1] : null

  return <div className="navigation">
    {previousVersion &&
      <Link to={toVersionLink(previousVersion._versionId)}>{T('previous')}</Link>
    }
    {' '}
    <b>
      {currentVersion._versionNumber
        ? T('version', { version: currentVersion._versionNumber })
        : T('newestVersion')
      }
    </b>
    {' '}
    {nextVersion &&
      <Link to={toVersionLink(nextVersion._versionId)}>{T('next')}</Link>
    }
  </div>
}

interface VersionLinkProps {
  version: Version
  toVersionLink: (versionId: string | null) => string
  current?: boolean
}

function VersionLink({version, toVersionLink, current}: VersionLinkProps) {
  const formatTime = useFormatTime()
  return <Link to={toVersionLink(version._versionId)} className={current ? 'current' : ''}>
    {version._versionNumber}
    {' '}
    <span className="timestamp">({formatTime(new Date(`2000-01-01T${version._updatedAt}`))})</span>
  </Link>
}
