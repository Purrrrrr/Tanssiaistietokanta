import React from 'react';
import {AnchorButton, Navbar, Alignment} from "@blueprintjs/core";
import {Breadcrumbs} from "./Breadcrumbs";
import LoginForm from "./LoginForm";
import {AdminOnly} from 'services/users';
import {navigate} from "@reach/router"

function Navigation() {
  return <>
    <Navbar>
      <Navbar.Group>
        <NavButton href="/" text="Tanssitapahtumat" />
        <AdminOnly>
          <NavButton href="/dances" text="Tanssitietokanta" />
          <NavButton href="/legacy" text="Legacy" />
        </AdminOnly>
      </Navbar.Group>
      <Navbar.Group align={Alignment.RIGHT}>
        <LoginForm />
      </Navbar.Group>
    </Navbar>
    <Breadcrumbs/>
  </>;
}

function NavButton({href, ...props}) {
  return <AnchorButton minimal {...props} href={href} 
    onClick={(e) => {e.preventDefault(); navigate(href);}} />;
}

export default Navigation;
