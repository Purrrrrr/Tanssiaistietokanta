import React from 'react'
import { useNavigate } from 'react-router-dom'

import {AdminOnly} from 'services/users'

import {AnchorButton, Breadcrumbs, Navbar } from 'libraries/ui'
import {useTranslation} from 'i18n'

import LoginForm from './LoginForm'


function Navigation() {
  return <nav>
    <Navbar id="navigation">
      <Navbar.Group>
        <Breadcrumbs label={useTranslation('navigation.breadcrumbs')}/>
      </Navbar.Group>
      <Navbar.Group align="right">
        <AdminOnly>
          <NavButton icon={<span style={{marginRight: 6}}>💃</span>} href="/dances" text={useTranslation('navigation.dances')} />
          <Navbar.Divider />
        </AdminOnly>
        <LoginForm />
      </Navbar.Group>
    </Navbar>
  </nav>
}

function NavButton({href, ...props}) {
  const navigate = useNavigate()
  return <AnchorButton minimal {...props} href={href}
    onClick={(e: React.MouseEvent) => {e.preventDefault(); navigate(href)}}
  />
}

export default Navigation
