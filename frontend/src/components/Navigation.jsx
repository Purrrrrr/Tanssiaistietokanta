import React from 'react';
import {AnchorButton, Navbar, Alignment} from "@blueprintjs/core";
import LoginForm from "./LoginForm";
import {AdminOnly} from 'services/users';
import {navigate} from "@reach/router"

function Navigation() {
  return <Navbar id="navigation">
    <Navbar.Group>
      <NavButton href="/" text="Tanssitapahtumat" />
      <AdminOnly>
        <NavButton href="/dances" text="Tanssitietokanta" />
      </AdminOnly>
    </Navbar.Group>
    <Navbar.Group align={Alignment.RIGHT}>
      <LoginForm />
    </Navbar.Group>
  </Navbar>;
}

function NavButton({href, ...props}) {
  return <AnchorButton minimal {...props} href={href} 
    onClick={(e) => {e.preventDefault(); navigate(href);}} />;
}

export default Navigation;
