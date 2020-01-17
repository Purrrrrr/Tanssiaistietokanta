import React from 'react';
import AppRoutes from "./routes";
import NavigationLayout from "components/NavigationLayout";
import {UserContextProvider} from "services/users";
import {apolloClient, ApolloProvider} from "services/Apollo";

function DanceOrganizer() {
  return <ApolloProvider client={apolloClient}>
    <UserContextProvider>
      <NavigationLayout>
        <AppRoutes />
      </NavigationLayout>
    </UserContextProvider>
  </ApolloProvider>;
}

export default DanceOrganizer;
