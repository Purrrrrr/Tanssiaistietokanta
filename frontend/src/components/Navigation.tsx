import React from 'react'
import { useNavigate } from 'react-router-dom'

import {AdminOnly} from 'services/users'

import {AnchorButton, Breadcrumbs, Navbar } from 'libraries/ui'

import LoginForm from './LoginForm'

function Navigation() {
  return <nav>
    <Navbar id="navigation">
      <Navbar.Group>
        <Breadcrumbs/>
      </Navbar.Group>
      <Navbar.Group align="right">
        <AdminOnly>
          <NavButton href="/dances" text="Tanssitietokanta" />
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
    onClick={(e) => {e.preventDefault(); navigate(href)}}
  />
}

export default Navigation
