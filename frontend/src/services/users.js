import React, {createContext, useContext, useState} from 'react';

export const UserContext = createContext();

const ADMIN = {name: "Test User", isAdmin: true};

export function UserContextProvider({children}) {
  const [user, setUser] = useState(ADMIN);
  const userContext = {
    user,
    login: () => {setUser(ADMIN)},
    logout: () => {setUser(null)} 
  };
  return <UserContext.Provider value={userContext} children={children} />;
}

export function useIsAdmin() {
  const {user} = useContext(UserContext);
  return user && user.isAdmin;
}

export function AdminOnly({children}) {
  const isAdmin = useIsAdmin();
  return isAdmin && children;
}

