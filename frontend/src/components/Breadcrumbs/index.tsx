import React from 'react';
import {Breadcrumbs as BlueprintBreadcrumbs, Breadcrumb as BlueprintBreadcrumb} from "@blueprintjs/core";
import {useNavigate} from 'react-router-dom';
import {sortedPaths} from './sortedPaths'
import {useBreadcrumbPaths} from './context';

export {Breadcrumb, BreadcrumbContext} from './context';

export function Breadcrumbs() {
  const paths = useBreadcrumbPaths();
  return <BlueprintBreadcrumbs items={sortedPaths(paths)} breadcrumbRenderer={p => <BreadcrumbItem {...p} />} />;
}

function BreadcrumbItem(props : React.ComponentProps<typeof BlueprintBreadcrumb>) {
  const navigate = useNavigate();
  const onClick = props.onClick
    || ((e) => {navigate(props.href || "/"); e.preventDefault();});

  return <BlueprintBreadcrumb {...props} onClick={onClick} />;
}

