import React from 'react';
import {AnchorButton, Navbar, Alignment} from "@blueprintjs/core";
import LoginForm from "./LoginForm";
import {Breadcrumbs} from "./Breadcrumbs";
import {AdminOnly} from 'services/users';
import { useNavigate } from 'react-router-dom';

function Navigation() {
  return <nav>
    <Navbar id="navigation">
      <Navbar.Group>
        <Breadcrumbs/>
      </Navbar.Group>
      <Navbar.Group align={Alignment.RIGHT}>
        <AdminOnly>
          <NavButton href="/dances" text="Tanssitietokanta" />
          <Navbar.Divider />
        </AdminOnly>
        <LoginForm />
      </Navbar.Group>
    </Navbar>
  </nav>;
}
 
function NavButton({href, ...props}) {
  const navigate = useNavigate();
  return <AnchorButton minimal {...props} href={href}
  onClick={(e) => {e.preventDefault(); navigate(href);}} />;
}

export default Navigation;
