import React from 'react';
import { BrowserRouter} from 'react-router-dom';
//, Routes, Route, Outlet, useParams, useLocation, useHref
import AppRoutes from "./routes";
import NavigationLayout from "components/NavigationLayout";
import {UserContextProvider} from "services/users";
import {apolloClient, ApolloProvider} from "services/Apollo";

function DanceOrganizer() {
  return <ApolloProvider client={apolloClient}>
    <UserContextProvider>
      <BrowserRouter>
        <NavigationLayout>
          <AppRoutes/>
        </NavigationLayout>
      </BrowserRouter>
    </UserContextProvider>
  </ApolloProvider>;
}

  /*
function Test() {
  return <Routes>
    <Nesting path=":nestId/*" />
    <Page path="events/*" />
    <Page path="dances" />
    <Page path="/" />
  </Routes>;
}

function Nesting() {
  return <>
    <Page />
    <Routes>
      <Nesting path=":nestId/*" />
      <Route path="test" element={<K />}>
        <Page path="test2" />
        <Page path="dances" />
      </Route>
      <Page path="events/*" />
      <Page path="dances" />
    </Routes>
  </>;
}

function K() {
  return <><Page /><Outlet /></>;
}

function Page() {
  const m = useHref(".");
  const params = useParams();
  const location = useLocation();
  
  return <div>
    <h2>Params</h2>
    <pre>{JSON.stringify(params)}</pre>
    <h2>Match</h2>
    <pre>{JSON.stringify(m)}</pre>
    <h2>Path</h2>
    <pre>{JSON.stringify(location)}</pre>
  </div>;
}
   */

export default DanceOrganizer;
