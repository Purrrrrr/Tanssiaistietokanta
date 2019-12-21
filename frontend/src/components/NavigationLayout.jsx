import React from 'react';
import {BreadcrumbContext, Breadcrumbs} from "./Breadcrumbs";
import Navigation from "./Navigation";

function NavigationLayout({children}) {
  return <BreadcrumbContext>
    <Navigation/>
    <div id="content">
      <Breadcrumbs/>
      {children}
    </div>
  </BreadcrumbContext>;
}

export default NavigationLayout;
