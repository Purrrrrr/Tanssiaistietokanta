import { useNavigate } from 'react-router-dom'

import {AdminOnly} from 'services/users'

import {AnchorButton, Breadcrumbs } from 'libraries/ui'
import {useTranslation} from 'i18n'

function Navigation() {
  return <nav className="flex flex-wrap min-h-12.5 h-auto justify-between px-3.5 items-center shadow-sm">
    <div className="grow">
      <Breadcrumbs label={useTranslation('navigation.breadcrumbs')}/>
    </div>
    <div>
      <AdminOnly>
        <NavButton icon={<span className="mr-1.5">💃</span>} href="/dances" text={useTranslation('navigation.dances')} />
      </AdminOnly>
    </div>
  </nav>
}

function NavButton({href, ...props}) {
  const navigate = useNavigate()
  return <AnchorButton minimal {...props} href={href}
    onClick={(e) => {e.preventDefault(); navigate(href)}}
  />
}

export default Navigation
