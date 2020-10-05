import React from 'react';
import {BreadcrumbContext, Breadcrumbs} from "./Breadcrumbs";
import Navigation from "./Navigation";

function NavigationLayout({children}) {
  if (navigationHidden()) {
    return <BreadcrumbContext children={children} />
  }

  return <BreadcrumbContext>
    <Navigation/>
    <main id="content">
      <Breadcrumbs/>
      {children}
    </main>
  </BreadcrumbContext>;
}

function navigationHidden() {
  const param = getUrlParam("hideUI");
  const isPrintPage = window.location.pathname.includes("/print/");
  const paramDefault = isPrintPage ? "true" : "false"
  return (param ?? paramDefault) !== "false";
}

function getUrlParam(param) {
  const query = window.location.search;
  const params = new URLSearchParams(query.substring(1));
  return params.get(param);
}

export default NavigationLayout;
