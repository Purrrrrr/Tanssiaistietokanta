import { Fragment } from 'react'
import { Link } from 'react-router-dom'

import SideBar from 'components/SideBar'
import { useT } from 'i18n'

import type { VersionCalendar, VersionSidebarProps } from './types'

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

export default function VersionChooser({name, entityId: id, versionId, versions, toVersionLink}: VersionChooserProps) {
  const T = useT('versioning')
  const toLink = (v: string | null) => toVersionLink(id, v)

  return <SideBar>
    <div className="version-chooser">
      <h2>{name} - {T('versionHistory')}</h2>
      <VersionNavigation entityId={id} versions={versions} versionId={versionId} toVersionLink={toVersionLink} />
      <div className="versions">
        <h3>{T('now')}</h3>
        <Link to={toLink(null)} className={!versionId ? 'current' : ''}>
          {T('newestVersion')}
        </Link>
        {versions.map(day =>
          <Fragment key={day.date}>
            <h3>{day.date}</h3>
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

function VersionNavigation({entityId: id, versionId, versions, toVersionLink}: Omit<VersionChooserProps, 'name'>) {
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
      <Link to={toVersionLink(id, previousVersion._versionId)}>{T('previous')}</Link>
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
      <Link to={`events/${id}/version/${nextVersion._versionId}`}>{T('next')}</Link>
    }
  </div>
}

interface VersionLinkProps {
  version: Version
  toVersionLink: (versionId: string | null) => string
  current?: boolean
}

function VersionLink({version, toVersionLink, current}: VersionLinkProps) {
  return <Link to={toVersionLink(version._versionId)} className={current ? 'current' : ''}>
    {version._versionNumber}
    {' '}
    <span className="timestamp">(klo {version._updatedAt})</span>
  </Link>
}
