import { Fragment } from 'react'
import { Link } from 'react-router-dom'

import SideBar from 'components/SideBar'

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

export default function VersionChooser({name, entityId: id, versionId, versions}: VersionChooserProps) {
  return <SideBar>
    <div className="version-chooser">
      <h2>Muokkaushistoria: {name}</h2>
      <Link to={`events/${id}`} className={!versionId ? 'current' : ''}>Nykyinen versio</Link>
      <div className="versions">
        {versions.map(day =>
          <Fragment key={day.date}>
            <h3>{day.date}</h3>
            <ol>
              {day.versions.map(version =>
                <li key={version._versionNumber}>
                  <VersionLink
                    version={version}
                    linkBase={`/events/${id}/version`}
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

interface VersionLinkProps {
  version: Version
  linkBase: string
  current?: boolean
}

function VersionLink({version, linkBase, current}: VersionLinkProps) {
  return <Link to={`${linkBase}/${version._versionId}`} className={current ? 'current' : ''}>
    {version._versionNumber}
    {' '}
    <span className="timestamp">(klo {version._updatedAt})</span>
  </Link>
}
