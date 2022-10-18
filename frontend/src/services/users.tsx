import React, {createContext, useContext, useState} from 'react'

interface User {
  name: string,
  isAdmin: boolean
}
interface UserContextType {
  user: User | null,
  login: () => void,
  logout: () => void,
}

export const UserContext = createContext<UserContextType>({
  user: null,
  login: () => { /* Dummy function */ },
  logout: () => { /* Dummy function */ },
})

const ADMIN = {name: 'Test User', isAdmin: true}

export function UserContextProvider({children}) {
  const [user, setUser] = useState<User | null>(ADMIN)
  const userContext = {
    user,
    login: () => {setUser(ADMIN)},
    logout: () => {setUser(null)}
  }
  return <UserContext.Provider value={userContext} children={children} />
}

export function useIsAdmin() {
  const {user} = useContext(UserContext)
  return user && user.isAdmin
}

//TODO: better type
export function AdminOnly({children, fallback} : {children: any, fallback?: any}) {
  const isAdmin = useIsAdmin()
  return isAdmin ? children : (fallback ?? false)
}

